import { Helmet } from "react-helmet-async";
import CreateFreeCardsHeader from "@/components/create-free-cards/header";
import CreateFreeCardsFooter from "@/components/create-free-cards/footer";
import CreateFreeCardsContactSection from "@/components/create-free-cards/contact";
import CreateFreeCardsChosenSection from "@/components/create-free-cards/chosen";
import CreateFreeCardsStoreSection from "@/components/create-free-cards/store";
import CreateFreeCardsStepperSection from "@/components/create-free-cards/stepper";
import CreateFreeCardsBannerSection from "@/components/create-free-cards/banner";
import FloatingWidget from "@/components/floating";

export default function CreateFreeCards() {
  return (
    <>
      <Helmet>
        <title>{"MIỄN PHÍ | Tạo Thiệp Cưới Online"}</title>
      </Helmet>
      <div className="h-[100vh] overflow-x-hidden">
        <CreateFreeCardsHeader />
        <CreateFreeCardsBannerSection />
        <CreateFreeCardsStepperSection />
        <CreateFreeCardsStoreSection />
        <CreateFreeCardsChosenSection />
        <CreateFreeCardsContactSection />
        <CreateFreeCardsFooter />
      </div>
      <FloatingWidget />
    </>
  );
}
