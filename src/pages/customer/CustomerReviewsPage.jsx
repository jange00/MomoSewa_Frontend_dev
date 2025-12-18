import { useState } from "react";
import { FiStar, FiEdit, FiX, FiSave } from "react-icons/fi";
import toast from "react-hot-toast";
import Card from "../../ui/cards/Card";
import Badge from "../../ui/badges/Badge";
import Button from "../../ui/buttons/Button";
import Input from "../../ui/inputs/Input";
import { useAuth } from "../../hooks/useAuth";
import { useGet, usePatch } from "../../hooks/useApi";
import { API_ENDPOINTS } from "../../api/config";

const CustomerReviewsPage = () => {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 5, review: "" });
  const { isAuthenticated } = useAuth();

  // Fetch reviews from API
  const { data: reviewsData, isLoading, refetch } = useGet(
    'user-reviews',
    API_ENDPOINTS.REVIEWS,
    { 
      showErrorToast: true,
      enabled: isAuthenticated, // Only fetch when authenticated
      refetchOnMount: true, // Always refetch when component mounts
    }
  );

  const reviews = Array.isArray(reviewsData?.data?.reviews) ? reviewsData.data.reviews :
                  Array.isArray(reviewsData?.data) ? reviewsData.data : [];

  // Update review mutation
  const updateReviewMutation = usePatch('user-reviews', API_ENDPOINTS.REVIEWS, {
    showSuccessToast: true,
    showErrorToast: true,
  });

  const handleEdit = (review) => {
    const reviewId = review._id || review.id;
    setEditingId(reviewId);
    setEditForm({ rating: review.rating, review: review.review || review.comment || review.body || "" });
  };

  const handleSaveEdit = async () => {
    if (!editForm.review.trim()) {
      toast.error("Please enter a review");
      return;
    }

    try {
      await updateReviewMutation.mutateAsync(
        { rating: editForm.rating, comment: editForm.review },
        {
          onSuccess: () => {
            refetch();
            setEditingId(null);
            setEditForm({ rating: 5, review: "" });
          },
        }
      );
    } catch (error) {
      console.error("Failed to update review:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ rating: 5, review: "" });
  };

  const renderStars = (rating, editable = false, onChange = null) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => editable && onChange && onChange(i + 1)}
        className={editable ? "cursor-pointer hover:scale-110 transition-transform" : ""}
        disabled={!editable}
      >
        <FiStar
          className={`w-4 h-4 ${
            i < rating
              ? "text-golden-amber fill-golden-amber"
              : "text-charcoal-grey/20"
          }`}
        />
      </button>
    ));
  };

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-charcoal-grey mb-2">
            My Reviews
          </h1>
          <p className="text-charcoal-grey/70">
            Reviews and ratings you've submitted
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-deep-maroon"></div>
          </div>
        )}

        {/* Reviews List */}
        {!isLoading && Array.isArray(reviews) && (
          <div className="space-y-4">
            {reviews.map((review) => {
              if (!review) return null;
              const reviewId = review._id || review.id;
              if (!reviewId) return null;
              return (
                <Card key={reviewId} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-charcoal-grey text-lg">
                      {review.productName || review.product?.name || 'Product'}
                    </h3>
                    {review.orderId && (
                      <Badge variant="default">Order #{review.orderId}</Badge>
                    )}
                  </div>
                  {editingId === (review._id || review.id) ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-charcoal-grey mb-2">
                          Rating
                        </label>
                        <div className="flex items-center gap-2">
                          {renderStars(editForm.rating, true, (newRating) =>
                            setEditForm({ ...editForm, rating: newRating })
                          )}
                          <span className="text-sm text-charcoal-grey/60 ml-2">
                            {editForm.rating} / 5
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-charcoal-grey mb-2">
                          Review
                        </label>
                        <textarea
                          value={editForm.review}
                          onChange={(e) => setEditForm({ ...editForm, review: e.target.value })}
                          placeholder="Write your review..."
                          rows={4}
                          className="w-full px-4 py-2 border border-charcoal-grey/12 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-white text-sm resize-none"
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button variant="primary" size="sm" onClick={handleSaveEdit}>
                          <FiSave className="w-4 h-4" />
                          Save
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                          <FiX className="w-4 h-4" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-charcoal-grey/70 mb-2">{review.review || review.comment || review.body}</p>
                      <p className="text-sm text-charcoal-grey/60">
                        {review.date || review.createdAt || 'Recently'}
                      </p>
                    </>
                  )}
                </div>
                {editingId !== reviewId && (
                  <button
                    onClick={() => handleEdit(review)}
                    className="p-2 rounded-lg hover:bg-charcoal-grey/5 text-charcoal-grey/60"
                  >
                    <FiEdit className="w-5 h-5" />
                  </button>
                )}
              </div>
            </Card>
              );
            })}
          </div>
        )}

        {!isLoading && reviews.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <div className="text-6xl mb-4">⭐</div>
              <h3 className="text-xl font-bold text-charcoal-grey mb-2">No reviews yet</h3>
              <p className="text-charcoal-grey/60 mb-6">
                Start reviewing your orders to help others make better choices
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CustomerReviewsPage;

