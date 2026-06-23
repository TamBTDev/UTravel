import { useState, useEffect } from "react";
import { Loader, Alert, Select, SegmentedControl } from "@mantine/core";
import { IconSearch, IconMessage2, IconAlertCircle } from "@tabler/icons-react";
import { vendorService, VendorReview } from "../../user/services/vendorService";
import { notifications } from "@mantine/notifications";
import { ReviewStats } from "./reviews/ReviewStats";
import { ReviewRow } from "./reviews/ReviewRow";

export const VendorReviewsView = () => {
  const [reviews, setReviews] = useState<VendorReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("ALL");
  const [hotelFilter, setHotelFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL"); // ALL, REPLIED, UNREPLIED

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await vendorService.getVendorReviews();
      if (res.success) {
        setReviews(res.data);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Lỗi khi tải danh sách bình luận");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleReplySubmit = async (reviewId: number, replyText: string) => {
    try {
      const res = await vendorService.replyToReview(reviewId, replyText);
      if (res.success) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? {
                  ...r,
                  vendorReply: replyText,
                  vendorReplyAt: new Date().toISOString(),
                }
              : r,
          ),
        );
      }
    } catch (err: any) {
      notifications.show({ title: 'Lỗi', message: err.message || "Không thể gửi phản hồi", color: 'red' });
      throw err;
    }
  };

  const removeVietnameseTones = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D");
  };

  // Unique hotel list for filters
  const hotels = Array.from(new Set(reviews.map((r) => r.hotel.name)));
  const hotelOptions = [
    { value: "ALL", label: "Tất cả chỗ nghỉ" },
    ...hotels.map((h) => ({ value: h, label: h })),
  ];

  // Filtering reviews
  const filteredReviews = reviews.filter((review) => {
    // Hotel filter
    if (hotelFilter !== "ALL" && review.hotel.name !== hotelFilter)
      return false;

    // Rating filter
    if (ratingFilter !== "ALL" && review.rating.toString() !== ratingFilter)
      return false;

    // Status filter
    if (statusFilter === "REPLIED" && !review.vendorReply) return false;
    if (statusFilter === "UNREPLIED" && review.vendorReply) return false;

    // Search query (Accent-insensitive)
    if (searchQuery.trim()) {
      const normalizedQuery = removeVietnameseTones(searchQuery.toLowerCase());
      const fullName =
        `${review.user.firstName} ${review.user.lastName}`.toLowerCase();
      const comment = review.comment || "";
      const hotel = review.hotel.name;

      const matches =
        removeVietnameseTones(fullName).includes(normalizedQuery) ||
        removeVietnameseTones(comment.toLowerCase()).includes(
          normalizedQuery,
        ) ||
        removeVietnameseTones(hotel.toLowerCase()).includes(normalizedQuery);

      if (!matches) return false;
    }

    return true;
  });

  // Calculate statistics
  const totalReviewsCount = reviews.length;
  const averageRating =
    totalReviewsCount > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount
        ).toFixed(1)
      : "0.0";
  const repliedCount = reviews.filter((r) => r.vendorReply).length;
  const replyRate =
    totalReviewsCount > 0
      ? Math.round((repliedCount / totalReviewsCount) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Dynamic Stats Row */}
      <ReviewStats
        averageRating={averageRating}
        totalReviewsCount={totalReviewsCount}
        repliedCount={repliedCount}
        replyRate={replyRate}
      />

      {/* Filter Row */}
      <div className="bg-white border border-border-hairline rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 md:max-w-2xl">
          <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm theo nội dung, tên khách, chỗ nghỉ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2 bg-surface-container-low border border-border-hairline rounded-lg text-sm text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-medium"
          />
        </div>

        {/* Selects */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch">
          <Select
            value={hotelFilter}
            onChange={(val) => setHotelFilter(val || "ALL")}
            data={hotelOptions}
            placeholder="Chỗ nghỉ"
            className="w-full sm:w-48"
            styles={{ input: { fontSize: "13px", fontWeight: 600 } }}
          />

          <Select
            value={ratingFilter}
            onChange={(val) => setRatingFilter(val || "ALL")}
            data={[
              { value: "ALL", label: "Tất cả xếp hạng" },
              { value: "5", label: "5 Sao" },
              { value: "4", label: "4 Sao" },
              { value: "3", label: "3 Sao" },
              { value: "2", label: "2 Sao" },
              { value: "1", label: "1 Sao" },
            ]}
            placeholder="Xếp hạng"
            className="w-full sm:w-40"
            styles={{ input: { fontSize: "13px", fontWeight: 600 } }}
          />
        </div>
      </div>

      {/* Status Segmented Control */}
      <div className="flex justify-start">
        <SegmentedControl
          value={statusFilter}
          onChange={setStatusFilter}
          data={[
            { label: `Tất cả (${filteredReviews.length})`, value: "ALL" },
            { label: "Chưa phản hồi", value: "UNREPLIED" },
            { label: "Đã phản hồi", value: "REPLIED" },
          ]}
          color="var(--color-primary)"
          className="bg-surface-container-low font-semibold text-xs border border-border-hairline"
        />
      </div>

      {/* Reviews list */}
      <section className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl border border-border-hairline p-16 text-center flex flex-col items-center justify-center shadow-sm">
            <Loader color="var(--color-primary)" size="md" />
            <p className="text-sm text-on-surface-variant font-medium mt-3">
              Đang tải dữ liệu bình luận...
            </p>
          </div>
        ) : error ? (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="light"
            className="rounded-lg"
          >
            {error}
          </Alert>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white rounded-xl border border-border-hairline p-16 text-center flex flex-col items-center justify-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-outline mb-4">
              <IconMessage2 size={32} />
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-1">
              Không tìm thấy bình luận nào
            </h3>
            <p className="text-on-surface-variant max-w-sm">
              Không có bình luận nào khớp với bộ lọc tìm kiếm hiện tại của bạn.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <ReviewRow
                key={review.id}
                review={review}
                onReplySubmit={handleReplySubmit}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
