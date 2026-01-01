import { useState, useEffect } from "react";
import { FiX, FiUser, FiMail, FiPhone, FiCalendar, FiEdit2, FiSave } from "react-icons/fi";
import Button from "../../../ui/buttons/Button";
import Input from "../../../ui/inputs/Input";
import toast from "react-hot-toast";

const UserDetailModal = ({ user, isOpen, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    status: user?.status || "active",
  });

  // Update formData when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        status: user.status || "active",
      });
      setIsEditing(false); // Reset editing state when user changes
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const userId = user._id || user.id;
    if (!userId) {
      toast.error("User ID is required");
      return;
    }
    onUpdate?.(userId, formData);
    // Note: Success toast is handled by the parent component
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-charcoal-grey/10 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-black text-charcoal-grey">User Details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-charcoal-grey/5 text-charcoal-grey/60"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* User Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-deep-maroon to-golden-amber flex items-center justify-center text-white font-bold text-3xl">
              {(user.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-black text-charcoal-grey">{user.name || 'User'}</h3>
              <span className="inline-block mt-2 px-3 py-1 rounded-lg bg-charcoal-grey/10 text-charcoal-grey/70 text-sm font-medium">
                {user.role}
              </span>
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-4">
            {isEditing ? (
              <>
                <Input
                  label="Full Name"
                  icon={FiUser}
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
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
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 text-charcoal-grey/70">
                  <FiUser className="w-5 h-5" />
                  <span className="font-semibold">Name:</span>
                  <span>{user.name}</span>
                </div>
                <div className="flex items-center gap-3 text-charcoal-grey/70">
                  <FiMail className="w-5 h-5" />
                  <span className="font-semibold">Email:</span>
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-charcoal-grey/70">
                  <FiPhone className="w-5 h-5" />
                  <span className="font-semibold">Phone:</span>
                  <span>{user.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-charcoal-grey/70">
                  <FiCalendar className="w-5 h-5" />
                  <span className="font-semibold">Joined:</span>
                  <span>{user.joinDate}</span>
                </div>
                <div className="flex items-center gap-3 text-charcoal-grey/70">
                  <span className="font-semibold">Status:</span>
                  <span
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      user.status === "active"
                        ? "bg-green-50 text-green-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {user.status}
                  </span>
                </div>
                {user.totalOrders !== undefined && (
                  <div className="flex items-center gap-3 text-charcoal-grey/70">
                    <span className="font-semibold">Total Orders:</span>
                    <span>{user.totalOrders}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-charcoal-grey/10">
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
                  Edit User
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
  );
};

export default UserDetailModal;

