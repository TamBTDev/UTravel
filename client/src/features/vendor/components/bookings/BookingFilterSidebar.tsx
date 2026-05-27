import { IconFilter } from "@tabler/icons-react";

interface FilterOptionProps {
  label: string;
  count: number;
  checked: boolean;
  onChange: () => void;
  colorClass: string;
}

const FilterOption = ({ label, count, checked, onChange, colorClass }: FilterOptionProps) => (
  <label className="flex items-center gap-3 cursor-pointer group py-1">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20 transition-all cursor-pointer"
    />
    <span className="font-body-base text-body-base text-on-surface-variant group-hover:text-primary transition-colors flex-grow">
      {label}
    </span>
    <span className={`font-label-caps text-label-caps px-2 py-0.5 rounded-full text-xs font-bold ${colorClass}`}>
      {count}
    </span>
  </label>
);

interface BookingFilterSidebarProps {
  statusFilters: Record<string, boolean>;
  onStatusFilterChange: (status: string) => void;
  uniqueHotels: string[];
  selectedHotels: string[];
  onHotelFilterChange: (hotelName: string) => void;
  statusCounts: {
    ALL: number;
    CONFIRMED: number;
    PENDING: number;
    CANCELLED: number;
    COMPLETED: number;
  };
}

export const BookingFilterSidebar = ({
  statusFilters,
  onStatusFilterChange,
  uniqueHotels,
  selectedHotels,
  onHotelFilterChange,
  statusCounts,
}: BookingFilterSidebarProps) => {
  return (
    <div className="bg-white rounded-xl border border-border-hairline p-5 shadow-sm space-y-5">
      <div>
        <h3 className="font-title-sm text-title-sm text-on-background mb-4 flex items-center gap-2">
          <IconFilter size={20} className="text-outline" />
          Bộ lọc trạng thái
        </h3>
        <div className="flex flex-col gap-2">
          <FilterOption
            label="Tất cả đơn hàng"
            count={statusCounts.ALL}
            checked={statusFilters.ALL}
            onChange={() => onStatusFilterChange("ALL")}
            colorClass="bg-surface-container text-on-surface-variant"
          />
          <FilterOption
            label="Đã xác nhận"
            count={statusCounts.CONFIRMED}
            checked={statusFilters.CONFIRMED}
            onChange={() => onStatusFilterChange("CONFIRMED")}
            colorClass="bg-green-100 text-green-800"
          />
          <FilterOption
            label="Chờ xử lý"
            count={statusCounts.PENDING}
            checked={statusFilters.PENDING}
            onChange={() => onStatusFilterChange("PENDING")}
            colorClass="bg-yellow-100 text-yellow-800"
          />
          <FilterOption
            label="Đã hoàn thành"
            count={statusCounts.COMPLETED}
            checked={statusFilters.COMPLETED}
            onChange={() => onStatusFilterChange("COMPLETED")}
            colorClass="bg-blue-100 text-blue-800"
          />
          <FilterOption
            label="Đã hủy"
            count={statusCounts.CANCELLED}
            checked={statusFilters.CANCELLED}
            onChange={() => onStatusFilterChange("CANCELLED")}
            colorClass="bg-red-100 text-red-800"
          />
        </div>
      </div>

      {uniqueHotels.length > 0 && (
        <>
          <hr className="border-border-hairline" />
          <div>
            <h3 className="font-title-sm text-title-sm text-on-background mb-4">
              Theo chỗ nghỉ
            </h3>
            <div className="flex flex-col gap-2">
              {uniqueHotels.map((hotelName) => (
                <label key={hotelName} className="flex items-center gap-3 cursor-pointer group py-1">
                  <input
                    type="checkbox"
                    checked={selectedHotels.includes(hotelName)}
                    onChange={() => onHotelFilterChange(hotelName)}
                    className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/20 transition-all cursor-pointer"
                  />
                  <span className="font-body-base text-body-base text-on-surface-variant group-hover:text-primary transition-colors truncate">
                    {hotelName}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
