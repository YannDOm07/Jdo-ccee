import { Metadata } from "next";
import { InscriptionClient } from "./client";

export const metadata: Metadata = {
  title: "Inscription | JDO 2026",
  description: "Formulaire d'inscription pour l'événement Jardin des Oliviers 2026.",
};

export default function RegistrationPage() {
  return <InscriptionClient />;
}
