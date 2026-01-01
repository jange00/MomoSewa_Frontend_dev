import { useState, useEffect } from "react";
import { FiX, FiShoppingBag, FiMail, FiPhone, FiCalendar, FiEdit2, FiSave, FiStar, FiCheck, FiXCircle, FiMapPin } from "react-icons/fi";
import Button from "../../../ui/buttons/Button";
import Input from "../../../ui/inputs/Input";
import toast from "react-hot-toast";

const VendorDetailModal = ({ vendor, isOpen, onClose, onUpdate, onApprove, onReject }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: vendor?.name || "",
    businessName: vendor?.businessName || "",
    email: vendor?.email || "",
    phone: vendor?.phone || "",
    status: vendor?.status || "pending",
  });

  // Update formData when vendor changes
  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name || "",
        businessName: vendor.businessName || "",
        email: vendor.email || "",
        phone: vendor.phone || "",
        status: vendor.status || "pending",
      });
      setIsEditing(false); // Reset editing state when vendor changes
    }
  }, [vendor]);

  if (!isOpen || !vendor) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const vendorId = vendor._id || vendor.id;

  const handleSave = () => {
    onUpdate?.(vendorId, formData);
    setIsEditing(false);
    // Don't show toast here - let the parent handle it
  };

  const handleApprove = () => {
    onApprove?.(vendorId);
    // Don't show toast here - let the parent handle it
  };

  const handleReject = () => {
    onReject?.(vendorId);
    // Don't show toast here - let the parent handle it
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-charcoal-grey/10 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-black text-charcoal-grey">Vendor Details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-charcoal-grey/5 text-charcoal-grey/60"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Vendor Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-deep-maroon to-golden-amber flex items-center justify-center text-white font-bold text-3xl">
              {(vendor.name || vendor.businessName || 'V').charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-black text-charcoal-grey">{vendor.businessName || vendor.name || 'Vendor'}</h3>
              {vendor.name && vendor.name !== vendor.businessName && (
                <p className="text-sm text-charcoal-grey/60">{vendor.name}</p>
              )}
              <span
                className={`inline-block mt-2 px-3 py-1 rounded-lg text-sm font-medium ${
                  vendor.status === "active"
                    ? "bg-green-50 text-green-600"
                    : vendor.status === "pending"
                    ? "bg-yellow-50 text-yellow-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {vendor.status}
              </span>
            </div>
          </div>

          {/* Vendor Information */}
          <div className="space-y-4">
            {isEditing ? (
              <>
                <Input
                  label="Owner Name"
                  icon={FiShoppingBag}
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
                <Input
                  label="Business Name"
                  icon={FiShoppingBag}
                  value={formData.businessName}
                  onChange={(e) => handleChange("businessName", e.target.value)}
                />
                <Input
                  label="Email"
                  type="email"
                  icon={FiMail}
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
                <Input
                  label="Phone"
                  icon={FiPhone}
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
                <div>
                  <label className="block text-sm font-semibold text-charcoal-grey mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    className="w-full px-4 py-2.5 border border-charcoal-grey/12 rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 text-charcoal-grey/70">
                  <FiShoppingBag className="w-5 h-5" />
                  <span className="font-semibold">Business:</span>
                  <span>{vendor.businessName}</span>
                </div>
                <div className="flex items-center gap-3 text-charcoal-grey/70">
                  <FiShoppingBag className="w-5 h-5" />
                  <span className="font-semibold">Owner:</span>
                  <span>{vendor.name}</span>
                </div>
                <div className="flex items-center gap-3 text-charcoal-grey/70">
                  <FiMail className="w-5 h-5" />
                  <span className="font-semibold">Email:</span>
                  <span>{vendor.email}</span>
                </div>
                <div className="flex items-center gap-3 text-charcoal-grey/70">
                  <FiPhone className="w-5 h-5" />
                  <span className="font-semibold">Phone:</span>
                  <span>{vendor.phone}</span>
                </div>
                {(vendor.createdAt || vendor.joinDate) && (
                  <div className="flex items-center gap-3 text-charcoal-grey/70">
                    <FiCalendar className="w-5 h-5" />
                    <span className="font-semibold">Joined:</span>
                    <span>
                      {vendor.joinDate || 
                        (vendor.createdAt ? new Date(vendor.createdAt).toLocaleDateString() : 'N/A')}
                    </span>
                  </div>
                )}
                {vendor.rating && (
                  <div className="flex items-center gap-3 text-charcoal-grey/70">
                    <FiStar className="w-5 h-5 text-golden-amber" />
                    <span className="font-semibold">Rating:</span>
                    <span>{vendor.rating}</span>
                  </div>
                )}
                {vendor.totalOrders !== undefined && (
                  <div className="flex items-center gap-3 text-charcoal-grey/70">
                    <span className="font-semibold">Total Orders:</span>
                    <span>{vendor.totalOrders}</span>
                  </div>
                )}
                {vendor.totalRevenue !== undefined && (
                  <div className="flex items-center gap-3 text-charcoal-grey/70">
                    <span className="font-semibold">Total Revenue:</span>
                    <span>Rs. {vendor.totalRevenue.toLocaleString()}</span>
                  </div>
                )}
                {vendor.businessAddress && (
                  <div className="flex items-start gap-3 text-charcoal-grey/70">
                    <FiMapPin className="w-5 h-5 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-semibold">Address: </span>
                      <span>{vendor.businessAddress}</span>
                    </div>
                  </div>
                )}
                {vendor.businessLicense && (
                  <div className="flex items-center gap-3 text-charcoal-grey/70">
                    <span className="font-semibold">License:</span>
                    <span>{vendor.businessLicense}</span>
                  </div>
                )}
                {vendor.applicationDate && (
                  <div className="flex items-center gap-3 text-charcoal-grey/70">
                    <FiCalendar className="w-5 h-5" />
                    <span className="font-semibold">Applied:</span>
                    <span>{new Date(vendor.applicationDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4 border-t border-charcoal-grey/10">
            {vendor.status === "pending" && !isEditing && (
              <div className="flex gap-3">
                <Button variant="primary" size="md" onClick={handleApprove} className="flex-1">
                  <FiCheck className="w-4 h-4 mr-2" />
                  Approve Vendor
                </Button>
                <Button variant="ghost" size="md" onClick={handleReject} className="flex-1 text-red-600 hover:bg-red-50">
                  <FiXCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            )}
            <div className="flex gap-3">
              {isEditing ? (
                <>
                  <Button variant="primary" size="md" onClick={handleSave} className="flex-1">
                    <FiSave className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="ghost" size="md" onClick={() => setIsEditing(false)} className="flex-1">
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="primary" size="md" onClick={() => setIsEditing(true)} className="flex-1">
                    <FiEdit2 className="w-4 h-4 mr-2" />
                    Edit Vendor
                  </Button>
                  <Button variant="ghost" size="md" onClick={onClose} className="flex-1">
                    Close
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDetailModal;

