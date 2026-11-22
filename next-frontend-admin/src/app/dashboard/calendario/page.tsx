"use client";

import { useState } from "react";
import { MainCalendar } from "@/components/dashboard/MainCalendar";
import { RightPanel } from "@/components/dashboard/RightPanel";
import { Appointment } from "@/services/appointment.service";

export default function CalendarioPage() {
  const [currentViewDate, setCurrentViewDate] = useState<Date>(new Date());
  const [selectedRepId, setSelectedRepId] = useState<string>("all");
  const [viewingAppointment, setViewingAppointment] = useState<Appointment | null>(null);
  const [isNewModalRequested, setIsNewModalRequested] = useState(false);

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full min-h-[calc(100vh-6rem)] pb-8">
      <MainCalendar
        currentViewDate={currentViewDate}
        setCurrentViewDate={setCurrentViewDate}
        selectedRepId={selectedRepId}
        setSelectedRepId={setSelectedRepId}
        externalViewingAppointment={viewingAppointment}
        setExternalViewingAppointment={setViewingAppointment}
        isNewModalRequested={isNewModalRequested}
        setIsNewModalRequested={setIsNewModalRequested}
      />
      <RightPanel
        currentViewDate={currentViewDate}
        setCurrentViewDate={setCurrentViewDate}
        selectedRepId={selectedRepId}
        setSelectedRepId={setSelectedRepId}
        onSelectAppointment={(app) => setViewingAppointment(app)}
        onRequestNewAppointment={() => setIsNewModalRequested(true)}
      />
    </div>
  );
}
