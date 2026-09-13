import { PagePlaceholder } from "@/components/page-placeholder"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BannersTab } from "@/features/website/components/banners-tab"
import { BlogTab } from "@/features/website/components/blog-tab"
import { FaqsTab } from "@/features/website/components/faqs-tab"
import { PricesTab } from "@/features/website/components/prices-tab"
import { ReviewsTab } from "@/features/website/components/reviews-tab"

const WebsiteFeature = () => {
  return (
    <div>
      <PagePlaceholder
        title="Website Content"
        subtitle="Manage everything that appears on the public Skyland website."
      />

      <Tabs defaultValue="banners" className="gap-4">
        <TabsList
          variant="line"
          className="h-auto w-full flex-wrap justify-start border-b border-border"
        >
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="prices">Quick Price Edit</TabsTrigger>
          <TabsTrigger value="blog">Blog</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
        </TabsList>

        <TabsContent value="banners">
          <BannersTab />
        </TabsContent>
        <TabsContent value="prices">
          <PricesTab />
        </TabsContent>
        <TabsContent value="blog">
          <BlogTab />
        </TabsContent>
        <TabsContent value="reviews">
          <ReviewsTab />
        </TabsContent>
        <TabsContent value="faqs">
          <FaqsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default WebsiteFeature
