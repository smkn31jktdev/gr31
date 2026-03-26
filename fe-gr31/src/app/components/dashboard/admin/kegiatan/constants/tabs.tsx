import {
  Sunrise,
  Moon,
  Utensils,
  BookOpen,
  Users,
  Activity,
  Heart,
} from "lucide-react";
import type { TabItem } from "../types";

export const TABS: TabItem[] = [
  {
    id: "bangun",
    label: "Bangun Tidur",
    icon: Sunrise,
    color: "bg-orange-500",
  },
  {
    id: "beribadah",
    label: "Beribadah",
    icon: Heart,
    color: "bg-rose-500",
  },
  {
    id: "makan",
    label: "Makan",
    icon: Utensils,
    color: "bg-emerald-500",
  },
  {
    id: "belajar",
    label: "Belajar",
    icon: BookOpen,
    color: "bg-blue-500",
  },
  {
    id: "bermasyarakat",
    label: "Bermasyarakat",
    icon: Users,
    color: "bg-violet-500",
  },
  {
    id: "olahraga",
    label: "Olahraga",
    icon: Activity,
    color: "bg-green-500",
  },
  {
    id: "tidur",
    label: "Tidur",
    icon: Moon,
    color: "bg-indigo-500",
  },
];
