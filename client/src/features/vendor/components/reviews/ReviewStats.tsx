import { IconStar, IconMessage2, IconCheck } from "@tabler/icons-react";

interface ReviewStatsProps {
  averageRating: string;
  totalReviewsCount: number;
  repliedCount: number;
  replyRate: number;
}

export const ReviewStats = ({
  averageRating,
  totalReviewsCount,
  repliedCount,
  replyRate,
}: ReviewStatsProps) => {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {/* Average Rating */}
      <div className="bg-white border border-border-hairline rounded-xl p-5 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-500">
          <IconStar size={24} className="fill-yellow-500 text-yellow-500" />
        </div>
        <div>
          <p className="text-xs text-outline font-bold uppercase tracking-wider">Đánh giá trung bình</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-on-surface">{averageRating}</span>
            <span className="text-xs text-outline font-semibold">/ 5 sao</span>
          </div>
        </div>
      </div>

      {/* Total Reviews */}
      <div className="bg-white border border-border-hairline rounded-xl p-5 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
          <IconMessage2 size={24} />
        </div>
        <div>
          <p className="text-xs text-outline font-bold uppercase tracking-wider">Tổng số bình luận</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-on-surface">{totalReviewsCount}</span>
            <span className="text-xs text-outline font-semibold">đánh giá</span>
          </div>
        </div>
      </div>

      {/* Reply Rate */}
      <div className="bg-white border border-border-hairline rounded-xl p-5 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
          <IconCheck size={24} />
        </div>
        <div>
          <p className="text-xs text-outline font-bold uppercase tracking-wider">Tỷ lệ phản hồi</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-on-surface">{replyRate}%</span>
            <span className="text-xs text-outline font-semibold">({repliedCount}/{totalReviewsCount})</span>
          </div>
        </div>
      </div>
    </section>
  );
};
