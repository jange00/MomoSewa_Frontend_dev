import { Link } from "react-router-dom";
import Button from "../../../ui/buttons/Button";
import Section from "../../../ui/sections/Section";
import Card from "../../../ui/cards/Card";

const MenuPreview = () => {
  const popularItems = [
    {
      name: "Steam Momo",
      description: "Classic steamed momo with your choice of filling",
      price: "Rs. 150",
      image: "🥟",
    },
    {
      name: "Fried Momo",
      description: "Crispy fried momo with special sauce",
      price: "Rs. 180",
      image: "🥟",
    },
    {
      name: "Jhol Momo",
      description: "Momo in spicy soup with traditional achar",
      price: "Rs. 200",
      image: "🥟",
    },
    {
      name: "Kothey Momo",
      description: "Pan-fried momo with golden crust",
      price: "Rs. 170",
      image: "🥟",
    },
  ];

  return (
    <Section className="bg-white">
      <div className="text-center mb-16">
        <h2 className="text-4xl lg:text-5xl font-black text-charcoal-grey mb-4">
          Popular <span className="text-deep-maroon">Momos</span>
        </h2>
        <p className="text-lg text-charcoal-grey/70 max-w-2xl mx-auto">
          Explore our most loved momo varieties, all customizable to your taste.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {popularItems.map((item, index) => (
          <Card
            key={index}
            className="p-6 text-center opacity-0 animate-fade-in-up"
            style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
          >
            <div className="text-6xl mb-4">{item.image}</div>
            <h3 className="font-bold text-charcoal-grey text-lg mb-2">{item.name}</h3>
            <p className="text-sm text-charcoal-grey/60 mb-4">{item.description}</p>
            <div className="flex items-center justify-between">
              <span className="font-bold text-deep-maroon text-lg">{item.price}</span>
              <Button size="sm" variant="primary" to="/menu">
                Order
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Button variant="primary" size="lg" to="/menu">
          View Full Menu
        </Button>
      </div>
    </Section>
  );
};

export default MenuPreview;
