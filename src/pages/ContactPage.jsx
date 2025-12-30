import { useState } from "react";
import { FiMail, FiPhone, FiMapPin, FiSend, FiClock, FiMessageCircle } from "react-icons/fi";
import Card from "../ui/cards/Card";
import Input from "../ui/inputs/Input";
import Button from "../ui/buttons/Button";
import toast from "react-hot-toast";
import { submitContactForm } from "../services/contactService";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setFieldErrors({});
    
    // Basic client-side validation (backend will also validate)
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.name.length < 2) {
      toast.error("Name must be at least 2 characters");
      return;
    }

    if (!/^[\w\.-]+@[\w\.-]+\.\w+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (formData.message.length < 10) {
      toast.error("Message must be at least 10 characters");
      return;
    }

    if (formData.message.length > 5000) {
      toast.error("Message must be less than 5000 characters");
      return;
    }

    if (formData.subject && formData.subject.length > 200) {
      toast.error("Subject must be less than 200 characters");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await submitContactForm({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone?.trim() || undefined,
        subject: formData.subject?.trim() || undefined,
        message: formData.message.trim(),
      });

      if (result.success) {
        toast.success(result.message || "Thank you for contacting us! We'll get back to you soon.");
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
        setFieldErrors({});
      } else {
        toast.error(result.message || "Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Contact form error:", error);
      
      // Handle validation errors (422 status) with details array
      if (error.response?.status === 422 && error.response?.data?.details) {
        const validationErrors = {};
        error.response.data.details.forEach((err) => {
          validationErrors[err.field] = err.msg;
        });
        setFieldErrors(validationErrors);
        
        // Show first error as toast
        const firstError = error.response.data.details[0];
        if (firstError) {
          toast.error(`${firstError.field}: ${firstError.msg}`);
        }
      } else if (error.response?.data?.message) {
        // Handle other API errors
        toast.error(error.response.data.message || "Failed to send message. Please try again.");
      } else {
        // Handle network or other errors
        toast.error(error.message || "Failed to send message. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: FiMail,
      title: "Email Us",
      content: "support@momosewa.com",
      link: "mailto:support@momosewa.com",
    },
    {
      icon: FiPhone,
      title: "Call Us",
      content: "+977 1-1234567",
      link: "tel:+97711234567",
    },
    {
      icon: FiMapPin,
      title: "Visit Us",
      content: "Kathmandu, Nepal",
      link: null,
    },
    {
      icon: FiClock,
      title: "Business Hours",
      content: "Mon - Sun: 9:00 AM - 10:00 PM",
      link: null,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal-grey/3 via-white to-golden-amber/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-deep-maroon via-[#7a2533] to-deep-maroon py-20">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl lg:text-6xl font-black text-white mb-6">
            Get in <span className="text-golden-amber">Touch</span>
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Have a question or feedback? We'd love to hear from you! Reach out to us and we'll respond as soon as possible.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-black text-charcoal-grey mb-6">Contact Information</h2>
              <div className="space-y-6">
                {contactInfo.map((info, index) => {
                  const Icon = info.icon;
                  const content = (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-deep-maroon/10 via-golden-amber/5 to-deep-maroon/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-deep-maroon" />
                      </div>
                      <div>
                        <h3 className="font-bold text-charcoal-grey mb-1">{info.title}</h3>
                        {info.link ? (
                          <a
                            href={info.link}
                            className="text-charcoal-grey/70 hover:text-deep-maroon transition-colors duration-200"
                          >
                            {info.content}
                          </a>
                        ) : (
                          <p className="text-charcoal-grey/70">{info.content}</p>
                        )}
                      </div>
                    </div>
                  );
                  return <div key={index}>{content}</div>;
                })}
              </div>
            </Card>

            {/* Social Media or Additional Info */}
            <Card className="p-6 bg-gradient-to-br from-deep-maroon/5 via-golden-amber/5 to-deep-maroon/5">
              <div className="flex items-center gap-3 mb-4">
                <FiMessageCircle className="w-6 h-6 text-deep-maroon" />
                <h3 className="text-xl font-bold text-charcoal-grey">Quick Response</h3>
              </div>
              <p className="text-charcoal-grey/70 text-sm">
                We typically respond within 24 hours. For urgent matters, please call us directly.
              </p>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <FiSend className="w-6 h-6 text-deep-maroon" />
                <h2 className="text-2xl font-black text-charcoal-grey">Send us a Message</h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Input
                      label="Your Name *"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      error={fieldErrors.name}
                    />
                  </div>
                  <div>
                    <Input
                      label="Email Address *"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      required
                      error={fieldErrors.email}
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Input
                      label="Phone Number"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+977 98XXXXXXXX"
                      error={fieldErrors.phone}
                    />
                  </div>
                  <div>
                    <Input
                      label="Subject"
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="What is this regarding?"
                      error={fieldErrors.subject}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-charcoal-grey mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    required
                    placeholder="Tell us how we can help you..."
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-golden-amber/25 focus:border-golden-amber/35 text-charcoal-grey bg-charcoal-grey/2 hover:bg-charcoal-grey/4 transition-all duration-300 text-sm font-medium resize-none ${
                      fieldErrors.message 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/25' 
                        : 'border-charcoal-grey/12'
                    }`}
                  />
                  {fieldErrors.message && (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.message}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  <FiSend className="w-5 h-5" />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <Card className="p-8">
            <h2 className="text-3xl font-black text-charcoal-grey mb-8 text-center">
              Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-charcoal-grey mb-2">How do I place an order?</h3>
                <p className="text-charcoal-grey/70 text-sm">
                  Simply browse our menu, add items to your cart, and proceed to checkout. You can pay online and track your order in real-time.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-charcoal-grey mb-2">What are your delivery areas?</h3>
                <p className="text-charcoal-grey/70 text-sm">
                  We currently deliver in major cities. Check your address during checkout to see if we deliver to your location.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-charcoal-grey mb-2">How can I become a vendor?</h3>
                <p className="text-charcoal-grey/70 text-sm">
                  Visit our vendor signup page and submit your application. Our team will review it and get back to you within 2-3 business days.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-charcoal-grey mb-2">What payment methods do you accept?</h3>
                <p className="text-charcoal-grey/70 text-sm">
                  We accept cash on delivery, credit/debit cards, and various digital payment methods for your convenience.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

