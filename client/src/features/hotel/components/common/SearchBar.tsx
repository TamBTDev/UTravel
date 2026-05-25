import { useState } from "react";
import {
  IconSearch,
  IconMapPin,
  IconCalendar,
  IconUser,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { DatePickerInput } from "@mantine/dates";

interface SearchBarProps {
  className?: string;
}

export const SearchBar = ({ className = "" }: SearchBarProps) => {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);

  const handleCheckInChange = (date: Date | null) => {
    setCheckIn(date);
    if (date && checkOut && date > checkOut) {
      setCheckOut(null);
    }
  };

  const datePickerStyles = {
    root: { width: "100%", height: "48px" },
    wrapper: { width: "100%", height: "100%" },
    input: {
      width: "100%",
      height: "100%",
      backgroundColor: "var(--color-surface-low)",
      borderColor: "var(--color-hairline)",
      color: "var(--color-on-surface)",
      paddingLeft: "36px",
      fontSize: "1rem",
      fontFamily: "var(--font-inter)",
      borderRadius: "0.5rem",
    },
    section: {
      pointerEvents: "none" as const,
      justifyContent: "flex-start",
      paddingLeft: "12px",
    },
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-2xl p-5 w-full border border-hairline ${className}`}
    >
      <div className="flex flex-col md:flex-row gap-3 items-end">
        {/* Destination */}
        <div className="flex-[1.5] min-w-0">
          <label className="text-label-caps text-on-surface-variant block mb-1.5">
            ĐIỂM ĐẾN
          </label>
          <div className="relative h-12 w-full">
            <IconMapPin
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-outline z-10 pointer-events-none"
            />
            <input
              className="absolute inset-0 w-full h-full bg-surface-low border border-hairline rounded-lg pl-9 pr-3 text-body text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="Bạn muốn đi đâu?"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="flex-[2] min-w-0 flex gap-2">
          <div className="flex-1 min-w-0 flex flex-col">
            <label className="text-label-caps text-on-surface-variant block mb-1.5">
              NHẬN PHÒNG
            </label>
            <DatePickerInput
              placeholder="Thêm ngày"
              value={checkIn}
              onChange={(val) => handleCheckInChange(val as Date | null)}
              minDate={new Date()}
              clearable
              valueFormat="DD/MM/YYYY"
              leftSection={
                <IconCalendar size={15} color="var(--color-outline)" />
              }
              styles={datePickerStyles}
            />
          </div>

          <div className="flex-1 min-w-0 flex flex-col">
            <label className="text-label-caps text-on-surface-variant block mb-1.5">
              TRẢ PHÒNG
            </label>
            <DatePickerInput
              placeholder="Thêm ngày"
              value={checkOut}
              onChange={(val) => setCheckOut(val as Date | null)}
              minDate={checkIn || new Date()} // Trả phòng phải sau ngày nhận phòng
              clearable
              valueFormat="DD/MM/YYYY"
              leftSection={
                <IconCalendar size={15} color="var(--color-outline)" />
              }
              styles={datePickerStyles}
            />
          </div>
        </div>

        {/* Guests */}
        <div className="flex-[1.5] min-w-0">
          <label className="text-label-caps text-on-surface-variant block mb-1.5">
            KHÁCH
          </label>
          <div className="relative h-12 w-full">
            <IconUser
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-outline z-10 pointer-events-none"
            />
            <input
              className="absolute inset-0 w-full h-full bg-surface-low border border-hairline rounded-lg pl-9 pr-3 text-body text-on-surface placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="2 Người lớn, 1 Phòng"
            />
          </div>
        </div>

        {/* Search btn */}
        <button
          onClick={() => navigate("/hotels")}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-semibold px-7 h-12 rounded-lg transition-colors shadow-md shrink-0 w-full md:w-auto"
        >
          <IconSearch size={16} />
          Tìm kiếm
        </button>
      </div>
    </div>
  );
};
