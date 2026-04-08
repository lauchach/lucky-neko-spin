import SlotMachine from "@/components/SlotMachine";
import bgImage from "@/assets/lucky-neko-bg.jpg";

const Index = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={bgImage}
          alt="Lucky Neko temple background"
          className="w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
      </div>

      {/* Game */}
      <div className="relative z-10 py-8 w-full">
        <SlotMachine />
      </div>
    </div>
  );
};

export default Index;
