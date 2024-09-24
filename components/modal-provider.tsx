"use client";

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/react"
import ProModal from "./pro-modal";

export const ModalProvider = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <ProModal />
    </>
  );
};
