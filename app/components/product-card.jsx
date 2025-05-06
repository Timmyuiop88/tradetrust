// app/components/product-card.jsx
import Image from "next/image"
import { Card } from "./card"
import Link from "next/link"
import { Badge } from "./badge"
import { motion } from "framer-motion"
import { Users, Tag, Star, Ticket } from "lucide-react"

const formatPrice = (price) => {
  if (typeof price !== 'number') {
    price = parseFloat(price) || 0;
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
}

const getLowestTicketPrice = (product) => {
  if (!product?.ticketTypes?.length) return 0;
  const ticketPrices = product.ticketTypes.map(ticket => parseFloat(ticket.price) || 0);
  return Math.min(...ticketPrices);
};

const getProductTypeDetails = (type) => {
  const types = {
    DIGITAL: { color: "bg-pink-500/10 text-pink-700 dark:text-pink-300", icon: Tag },
    EBOOK: { color: "bg-purple-500/10 text-purple-700 dark:text-purple-300", icon: Tag },
    COURSE: { color: "bg-blue-500/10 text-blue-700 dark:text-blue-300", icon: Users },
    EVENT: { color: "bg-green-500/10 text-green-700 dark:text-green-300", icon: Ticket },
    MEMBERSHIP: { color: "bg-amber-500/10 text-amber-700 dark:text-amber-300", icon: Users },
    CALL: { color: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300", icon: Users },
    COFFEE: { color: "bg-red-500/10 text-red-700 dark:text-red-300", icon: Tag },
  };
  return types[type] || types.DIGITAL;
};

export function ProductCard({ product }) {
  const { color, icon: Icon } = getProductTypeDetails(product.type);
  const avgRating = product.reviews?.reduce((acc, review) => acc + review.rating, 0) / product.reviews?.length || 0;

  return (
    <Link href={`/marketplace/products/${product.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="group relative overflow-hidden bg-card hover:bg-accent/5 transition-all duration-300">
          {/* Image Container */}
          <div className="aspect-[4/3] relative overflow-hidden bg-muted">
            {product.thumbnail ? (
              <>
                <Image
                  src={product.thumbnail}
                  alt={product.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted">
                <Icon className="h-12 w-12 text-muted-foreground/30" />
              </div>
            )}
            
            {/* Type Badge */}
            <Badge 
              className={`absolute top-3 left-3 ${color} border-0 font-medium backdrop-blur-sm bg-opacity-90 flex items-center gap-1`}
            >
              <Icon className="h-3 w-3" />
              <span className="text-xs">{product.type.toLowerCase()}</span>
            </Badge>

            {/* Price Tag */}
            <div className="absolute bottom-3 right-3">
              <Badge variant="secondary" className="font-medium text-sm backdrop-blur-sm bg-background/90">
                {product.type === 'EVENT' 
                  ? `From ${formatPrice(getLowestTicketPrice(product))}`
                  : formatPrice(product.price)}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            <div className="space-y-1">
              <h3 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                {product.title}
              </h3>
              {product.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {product.seller && (
                  <span className="text-muted-foreground hover:text-foreground transition-colors">
                    {product.seller.name}
                  </span>
                )}
              </div>
              
              {avgRating > 0 && (
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="font-medium">{avgRating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Quick Actions - Visible on Hover */}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/40 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </Card>
      </motion.div>
    </Link>
  )
}