import Section from "../../../ui/sections/Section";
import Card from "../../../ui/cards/Card";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sushant Mahato",
      role: "Customer",
      rating: 5,
      text: "Love how I can customize my momo fillings and achar! The delivery is always fast and fresh.",
      avatar: "👦",
    },
    {
      name: "Saroj Sah",
      role: "Vendor",
      rating: 5,
      text: "MomoSewa has helped me reach more customers. The platform is easy to use and sales have doubled!",
      avatar: "👨",
    },
    {
      name: "Sangita Adhikari",
      role: "Customer",
      rating: 5,
      text: "Best momo delivery service in Kathmandu! The customization options are amazing.",
      avatar: "👩",
    },
  ];

  return (
    <Section className="bg-gradient-to-b from-white to-charcoal-grey/3">
      <div className="text-center mb-16">
        <h2 className="text-4xl lg:text-5xl font-black text-charcoal-grey mb-4">
          What Our <span className="text-deep-maroon">Users</span> Say
        </h2>
        <p className="text-lg text-charcoal-grey/70 max-w-2xl mx-auto">
          Real feedback from customers and vendors who love MomoSewa.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <Card
            key={index}
            className="p-6 opacity-0 animate-fade-in-up"
            style={{ animationDelay: `${index * 0.15}s`, animationFillMode: "forwards" }}
          >
            <div className="flex items-center gap-1 mb-4">
              {[...Array(testimonial.rating)].map((_, i) => (
                <span key={i} className="text-golden-amber text-xl">★</span>
              ))}
            </div>
            <p className="text-charcoal-grey/70 mb-6 leading-relaxed">"{testimonial.text}"</p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-deep-maroon/20 to-golden-amber/20 flex items-center justify-center text-2xl">
                {testimonial.avatar}
              </div>
              <div>
                <h4 className="font-bold text-charcoal-grey">{testimonial.name}</h4>
                <p className="text-sm text-charcoal-grey/60">{testimonial.role}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
};

export default Testimonials;
