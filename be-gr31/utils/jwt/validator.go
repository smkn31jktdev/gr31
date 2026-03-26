package jwt

import (
	"context"
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"math/big"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// JWKSet represents a JSON Web Key Set
type JWKSet struct {
	Keys []JWK `json:"keys"`
}

// JWK represents a JSON Web Key
type JWK struct {
	Kid string `json:"kid"`
	Kty string `json:"kty"`
	Use string `json:"use"`
	N   string `json:"n"`
	E   string `json:"e"`
}

// JWKSClient handles fetching and caching JWKS
type JWKSClient struct {
	jwksURL string
	client  *http.Client
}

// NewJWKSClient creates a new JWKS client with custom URL
func NewJWKSClient(jwksURL string) *JWKSClient {
	return &JWKSClient{
		jwksURL: jwksURL,
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

// GetJWKSet fetches the JWKS from the URL
func (c *JWKSClient) GetJWKSet(ctx context.Context) (*JWKSet, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", c.jwksURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := c.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch JWKS: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("JWKS endpoint returned status %d", resp.StatusCode)
	}

	var jwkSet JWKSet
	if err := json.NewDecoder(resp.Body).Decode(&jwkSet); err != nil {
		return nil, fmt.Errorf("failed to decode JWKS: %w", err)
	}

	return &jwkSet, nil
}

func (jwk *JWK) GetPublicKey() (*rsa.PublicKey, error) {
	if jwk.Kty != "RSA" {
		return nil, fmt.Errorf("unsupported key type: %s", jwk.Kty)
	}
	nBytes, err := base64.RawURLEncoding.DecodeString(jwk.N)
	if err != nil {
		return nil, fmt.Errorf("failed to decode modulus: %w", err)
	}

	eBytes, err := base64.RawURLEncoding.DecodeString(jwk.E)
	if err != nil {
		return nil, fmt.Errorf("failed to decode exponent: %w", err)
	}

	n := new(big.Int).SetBytes(nBytes)
	var e int
	if len(eBytes) == 3 {
		e = int(eBytes[0])<<16 + int(eBytes[1])<<8 + int(eBytes[2])
	} else if len(eBytes) == 4 {
		e = int(eBytes[0])<<24 + int(eBytes[1])<<16 + int(eBytes[2])<<8 + int(eBytes[3])
	} else {
		return nil, fmt.Errorf("invalid exponent length")
	}

	return &rsa.PublicKey{
		N: n,
		E: e,
	}, nil
}

func ValidateJWTWithURL(tokenString, jwksURL string) (bool, error) {
	jwksClient := NewJWKSClient(jwksURL)

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		kid, ok := token.Header["kid"].(string)
		if !ok {
			return nil, fmt.Errorf("kid not found in token header")
		}
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		jwkSet, err := jwksClient.GetJWKSet(ctx)
		if err != nil {
			return nil, fmt.Errorf("failed to fetch JWKS: %w", err)
		}

		for _, jwk := range jwkSet.Keys {
			if jwk.Kid == kid {
				return jwk.GetPublicKey()
			}
		}

		return nil, fmt.Errorf("key with kid %s not found in JWKS", kid)
	})

	if err != nil {
		return false, fmt.Errorf("failed to parse/validate token: %w", err)
	}

	if !token.Valid {
		return false, fmt.Errorf("token is not valid")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return false, fmt.Errorf("failed to parse claims")
	}
	if exp, ok := claims["exp"].(float64); ok {
		expTime := time.Unix(int64(exp), 0)
		if time.Now().After(expTime) {
			return false, fmt.Errorf("token has expired at %s", expTime.Format(time.RFC3339))
		}
	} else {
		return false, fmt.Errorf("token does not contain expiration claim")
	}

	if nbf, ok := claims["nbf"].(float64); ok {
		nbfTime := time.Unix(int64(nbf), 0)
		if time.Now().Before(nbfTime) {
			return false, fmt.Errorf("token is not valid before %s", nbfTime.Format(time.RFC3339))
		}
	}

	return true, nil
}

func GetJWTClaimsWithURL(tokenString, jwksURL string) (jwt.MapClaims, error) {
	isValid, err := ValidateJWTWithURL(tokenString, jwksURL)
	if !isValid && err != nil {
		return nil, err
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		jwksClient := NewJWKSClient(jwksURL)
		kid := token.Header["kid"].(string)

		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		jwkSet, jwkErr := jwksClient.GetJWKSet(ctx)
		if jwkErr != nil {
			return nil, jwkErr
		}

		for _, jwk := range jwkSet.Keys {
			if jwk.Kid == kid {
				return jwk.GetPublicKey()
			}
		}

		return nil, fmt.Errorf("key not found")
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, fmt.Errorf("failed to parse claims")
	}

	return claims, nil
}
