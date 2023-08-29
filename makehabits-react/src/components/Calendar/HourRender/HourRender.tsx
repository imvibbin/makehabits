import { useState } from "react";
import { motion, PanInfo } from "framer-motion";
import EventDisplay from "../EventDisplay/EventDisplay";
import EventCreator from "../EventCreator/EventCreator";
import UserInterface from "../../../models/UserInterface";
import Habit from "../../../models/Habit";
import Appointment from "../../../models/Appointment";
import "./HourRender.css";

const HourRender = () => {
  const userData: UserInterface =
    JSON.parse(localStorage.getItem("USER_DATA") ?? "{}") || null;

  const hours = Array.from({ length: 24 }, (_, index) => index);
  const [addingEvent, setAddingEvent] = useState(false);
  const [selectedCell, setSelectedCell] = useState("");
  const [calendarSlotId, setCalendarSlotId] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [eventsData, setEventsData] = useState({
    events: [
      userData.activities.map((activity) => {
        // Extract the relevant information from the activity object
        const name = activity.task_name;

        // Check the type of the activity
        if (
          activity.task_type === "habit" &&
          "task_habit_repetitions" in activity
        ) {
          // Narrow the type of activity to Habit using a type guard
          const habit = activity as Habit;

          // Handle habit events
          const [startHour, endHour] = habit.task_hour_range
            .split("|")
            .map(Number);
          const duration = (endHour - startHour) * 60;
          const days = habit.task_habit_repetitions;
          const info = `hour${startHour}/day${days}`;

          return { name, info, duration, days };
        } else if (
          activity.task_type === "appointment" &&
          "task_date_range" in activity
        ) {
          // Narrow the type of activity to Appointment using a type guard
          const appointment = activity as Appointment;

          // Handle appointment events
          const [startHour, endHour] = appointment.task_hour_range
            .split("|")
            .map(Number);
          const duration = (endHour - startHour) * 60;
          const [startDate, endDate] = appointment.task_date_range.split("|");
          const days = Math.ceil(
            (new Date(endDate).getTime() - new Date(startDate).getTime()) /
              (1000 * 60 * 60 * 24),
          );
          const info = `hour${startHour}/day${
            new Date(startDate).getDay() + 1
          }`;

          return { name, info, duration, days };
        } else {
          return null;
        }
      }),
    ],
  });

  const handleCellClick = (cellId: string) => {
    if (!addingEvent && !isDragging) {
      setAddingEvent(true);
      setSelectedCell(cellId);
    }
  };

  const saveEvent = (
    cellId: string,
    eventName: string,
    eventDuration: number,
  ) => {
    // Implement logic to save the event to your eventsData
    setEventsData((prevState) => ({
      ...prevState,
      events: [
        ...prevState.events,
        { name: eventName, info: cellId, duration: eventDuration, days: 1 },
      ],
    }));
    setAddingEvent(false);
    setSelectedCell("");
  };

  const handleDragCommon = (info: PanInfo) => {
    setCalendarSlotId("");
    const slots = document.querySelectorAll(".calendar-slot");
    slots.forEach((slot) => {
      const rect = slot.getBoundingClientRect();
      if (
        info.point.x > rect.left &&
        info.point.x < rect.right &&
        info.point.y > rect.top &&
        info.point.y < rect.bottom
      ) {
        const id = slot.getAttribute("id") || "";
        setCalendarSlotId(id);
      }
    });
  };

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
    eventName: string,
  ) => {
    setIsDragging(false);
    handleDragCommon(info);
    setCalendarSlotId("");

    // Update the info property of the event with the new ID
    setEventsData((prevState) => ({
      ...prevState,
      events: prevState.events.map((event) =>
        event.name === eventName ? { ...event, info: calendarSlotId } : event,
      ),
    }));
    console.log(eventsData);
  };

  const handleDrag = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    setIsDragging(true);
    handleDragCommon(info);
  };

  // Main component
  return (
    <>
      {hours.map((hour) => (
        <div key={hour} className="row row-height w-100">
          {/* Display the hour */}
          <div className="col d-flex align-items-center justify-content-center text-center">
            {hour}:00 - {(hour + 1) % 24}:00
          </div>
          {/* Loop through days */}
          {[...Array(7)].map((_, index) => {
            const currentDivId = `hour${hour}/day${index + 1}`;
            const event = eventsData.events.find(
              (event) => event.info === currentDivId,
            );
            const eventName = event?.name || "";
            const eventDuration = event?.duration || 60;
            const eventDays = event?.days || 1;
            const isAddingEvent = addingEvent && selectedCell === currentDivId;

            return (
              <motion.div
                key={`event-${index}`}
                id={currentDivId}
                className={`col calendar-slot position-relative h-100 ${
                  isAddingEvent ? "add-event" : ""
                } ${
                  calendarSlotId === currentDivId ? "dragging-indicator" : ""
                }`}
                onClick={() => handleCellClick(currentDivId)}
              >
                {event && (
                  // Display EventDisplay component
                  <EventDisplay
                    eventData={event}
                    eventDuration={eventDuration}
                    eventDays={eventDays}
                    handleDragEnd={handleDragEnd}
                    handleDrag={handleDrag}
                    data-name={eventName}
                  />
                )}
                {!event && isAddingEvent && (
                  // Render BlankCell component only if isAddingEvent is true
                  <EventCreator
                    currentDivId={currentDivId}
                    isAddingEvent={isAddingEvent}
                    saveEvent={saveEvent}
                    handleCellClick={handleCellClick}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      ))}
    </>
  );
};

export default HourRender;
