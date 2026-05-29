import { useState } from "react";
import { Loader, TextInput } from "@mantine/core";
import { IconStar, IconArrowBackUp, IconSend } from "@tabler/icons-react";
import { VendorReview } from "../../../user/services/vendorService";
import dayjs from "dayjs";

interface ReviewRowProps {
  review: VendorReview;
  onReplySubmit: (reviewId: number, replyText: string) => Promise<void>;
}

export const ReviewRow = ({ review, onReplySubmit }: ReviewRowProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const hasReplied = !!review.vendorReply;
  const userInitial = review.user.firstName ? review.user.firstName.charAt(0).toUpperCase() : "?";

  const handleSendReply = async () => {
    const trimmed = replyText.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      await onReplySubmit(review.id, trimmed);
      setIsReplying(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = () => {
    setReplyText(review.vendorReply || "");
    setIsReplying(true);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <IconStar
            key={star}
            size={16}
            className={
              star <= rating
                ? "text-yellow-500 fill-yellow-500"
                : "text-outline-variant"
            }
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white border border-border-hairline rounded-xl p-5 md:p-6 shadow-sm hover:shadow transition-all duration-200">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        {/* Customer & Rating details */}
        <div className="flex items-start gap-4">
          {review.user.avatar ? (
            <img
              src={review.user.avatar}
              alt={`${review.user.firstName} ${review.user.lastName}`}
              className="w-10 h-10 rounded-full object-cover border border-border-hairline shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container font-extrabold flex items-center justify-center text-sm shrink-0">
              {userInitial}
            </div>
          )}
          <div>
            <h4 className="font-bold text-on-surface text-sm md:text-base">
              {review.user.firstName} {review.user.lastName}
            </h4>
            <p className="text-xs text-outline mt-0.5 font-medium">
              {dayjs(review.createdAt).format("DD/MM/YYYY HH:mm")} • tại{" "}
              <span className="text-primary font-semibold">{review.hotel.name}</span>
            </p>
            <div className="mt-1.5">{renderStars(review.rating)}</div>
          </div>
        </div>

        {/* Booking ID if available */}
        {review.bookingId && (
          <div className="text-xs font-bold text-outline uppercase tracking-wider bg-surface-container-high px-2.5 py-1 rounded self-start md:self-auto">
            Mã đơn: #UT-{review.bookingId}
          </div>
        )}
      </div>

      {/* Comment text */}
      <div className="mt-4 pl-0 md:pl-14 text-sm text-on-surface font-medium leading-relaxed">
        {review.comment ? (
          review.comment
        ) : (
          <span className="italic text-outline-variant font-normal">
            Người dùng không để lại bình luận viết, chỉ đánh giá điểm số.
          </span>
        )}
      </div>

      {/* Reply section */}
      <div className="mt-5 pl-0 md:pl-14">
        {hasReplied && !isReplying ? (
          /* Display existing reply */
          <div className="bg-surface-container-lowest border border-border-hairline rounded-lg p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <IconArrowBackUp size={14} className="scale-x-[-1]" />
                <span>Phản hồi từ bạn</span>
              </div>
              <span className="text-[10px] text-outline font-medium">
                {dayjs(review.vendorReplyAt).format("DD/MM/YYYY HH:mm")}
              </span>
            </div>
            <p className="text-sm text-on-surface font-semibold leading-relaxed">
              {review.vendorReply}
            </p>
            <button
              onClick={handleStartEdit}
              className="mt-2 text-xs font-bold text-outline hover:text-primary transition-colors underline"
            >
              Chỉnh sửa
            </button>
          </div>
        ) : isReplying ? (
          /* Reply input field */
          <div className="space-y-3">
            <TextInput
              placeholder="Nhập nội dung phản hồi của bạn..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              styles={{ input: { fontSize: "13px", fontWeight: 500 } }}
              disabled={submitting}
            />
            <div className="flex gap-2">
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim() || submitting}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded hover:bg-primary-hover disabled:opacity-50 transition-colors shadow-sm"
              >
                {submitting ? (
                  <Loader size="xs" color="white" />
                ) : (
                  <IconSend size={14} />
                )}
                <span>Gửi phản hồi</span>
              </button>
              <button
                onClick={() => setIsReplying(false)}
                disabled={submitting}
                className="px-3 py-1.5 bg-white border border-border-hairline text-on-surface text-xs font-bold rounded hover:bg-surface-container-low transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        ) : (
          /* Reply CTA button */
          <button
            onClick={() => {
              setReplyText("");
              setIsReplying(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-primary text-primary hover:bg-primary/5 text-xs font-bold rounded transition-colors shadow-sm"
          >
            <IconArrowBackUp size={14} className="scale-x-[-1]" />
            <span>Trả lời bình luận</span>
          </button>
        )}
      </div>
    </div>
  );
};
