import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Upload, X } from "lucide-react";
import { notifications } from '@mantine/notifications';
import { getBookingDetail } from "@/features/booking/services/bookingService";
import { reviewService } from "../services/reviewService";

const HIGH_LIGHT_OPTIONS = [
  "Friendly Staff",
  "Great View",
  "Quiet",
  "Spacious Room",
  "Fast WiFi",
  "Excellent Pool",
  "Clean",
  "Good Breakfast"
];

export default function CreateReview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [subRatings, setSubRatings] = useState({
    cleanlinessRating: 0,
    serviceRating: 0,
    locationRating: 0,
    valueRating: 0,
  });
  const [comment, setComment] = useState("");
  const [highlights, setHighlights] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await getBookingDetail(id!);
        setBooking(data);
      } catch (error) {
        notifications.show({ title: 'Lỗi', message: "Failed to load booking details", color: 'red' });
        navigate("/bookings");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBooking();
  }, [id, navigate]);

  const toggleHighlight = (tag: string) => {
    if (highlights.includes(tag)) {
      setHighlights(highlights.filter((h) => h !== tag));
    } else {
      setHighlights([...highlights, tag]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages((prev) => [...prev, ...filesArray]);
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      notifications.show({ title: 'Lỗi', message: "Please provide an overall rating", color: 'red' });
      return;
    }

    setSubmitting(true);
    try {
      // Note: In a real app, you would upload images to S3/Cloudinary first and get URLs.
      // Here we just mock it.
      const mockImageUrls = imagePreviews.length > 0 ? ["https://picsum.photos/400"] : [];

      await reviewService.createReview({
        bookingId: parseInt(id!),
        hotelId: booking.hotelId,
        rating,
        comment,
        cleanlinessRating: subRatings.cleanlinessRating,
        serviceRating: subRatings.serviceRating,
        locationRating: subRatings.locationRating,
        valueRating: subRatings.valueRating,
        highlights,
        images: mockImageUrls,
      });

      notifications.show({ title: 'Thành công', message: "Review submitted successfully!", color: 'green' });
      navigate("/bookings");
    } catch (error: any) {
      notifications.show({ title: 'Lỗi', message: error.response?.data?.error || "Failed to submit review", color: 'red' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!booking) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Share Your Experience</h1>
        <p className="text-gray-600">Your feedback helps millions of travelers find the perfect stay.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex gap-6 items-center">
          <div className="w-48 h-32 rounded-lg overflow-hidden shrink-0">
            <img
              src={booking.room?.hotel?.images?.[0] || "https://picsum.photos/400"}
              alt="Hotel"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-semibold text-gray-900">{booking.room?.hotel?.name}</h2>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Completed
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-1">
              {new Date(booking.checkInDate).toLocaleDateString()} — {new Date(booking.checkOutDate).toLocaleDateString()}
            </p>
            <p className="text-gray-700 text-sm">{booking.room?.type}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-b border-gray-100 pb-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Overall Experience</h3>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 border-l border-gray-100 pl-8">
            {Object.keys(subRatings).map((key) => {
              const label = key.replace("Rating", "").replace(/^./, (c) => c.toUpperCase());
              return (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-gray-700 text-sm">{label}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setSubRatings({ ...subRatings, [key]: star })}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= (subRatings as any)[key]
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-200 hover:text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Write your review</h3>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What did you like or dislike? Would you recommend this hotel?"
            className="w-full h-32 border border-gray-200 rounded-lg p-4 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          />
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Highlights</h3>
          <div className="flex flex-wrap gap-2">
            {HIGH_LIGHT_OPTIONS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleHighlight(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  highlights.includes(tag)
                    ? "bg-blue-100 text-blue-700 border-blue-200"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-transparent"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add Photos (Optional)</h3>
          <div className="flex flex-wrap gap-4">
            <label className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
              <Upload className="w-6 h-6 text-gray-400 mb-2" />
              <span className="text-xs font-medium text-gray-500">UPLOAD</span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative w-32 h-32 rounded-xl overflow-hidden group">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <button
            type="button"
            onClick={() => navigate("/bookings")}
            className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-8 py-2.5 bg-[#0a58ca] hover:bg-[#084298] text-white font-medium rounded-lg transition-colors disabled:opacity-70"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}
