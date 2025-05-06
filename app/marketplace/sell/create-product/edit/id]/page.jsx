"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useSession } from "next-auth/react"
import { useEdgeStore } from "@/app/lib/edgeStore"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

// UI Components
import { Button } from "@/app/components/button"
import { Input } from "@/app/components/input"
import { Textarea } from "@/app/components/textarea"
import { Label } from "@/app/components/label"
import { FileUploader } from "@/app/components/file-uploader"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/app/components/ui/select"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/app/components/card"
import { Switch } from "@/app/components/switch"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs"

// Icons
import { 
  ArrowRight, ArrowLeft, Upload, Check, X, Plus, Minus, 
  File, Image as ImageIcon, DollarSign, Calendar, Clock, 
  FileText, Package, Coffee, Video, BookOpen, Users, Ticket, AlertCircle,
  Clipboard, Link as LinkIcon, Loader2, Crown, Settings, Text, ListOrdered,
  LayoutList, FilePenLine, FileText as FileTextIcon, GripVertical, Share2,
  ExternalLink, HelpCircle, CalendarDays, Hash
} from "lucide-react"

// Form schemas for different product types
const baseProductSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0.01, "Price must be greater than 0")
  ),
  isBundle: z.boolean().default(false),
  categoryId: z.number().optional(),
  settings: z.object({
    allowComments: z.boolean().default(true),
    showSales: z.boolean().default(true),
    isPrivate: z.boolean().default(false),
    allowReviews: z.boolean().default(true),
    paywallContent: z.boolean().default(true),
    showAuthor: z.boolean().default(true),
  }).optional(),
});

const digitalProductSchema = baseProductSchema.extend({
  downloadLink: z.string().url("Please enter a valid URL").optional(),
  streamingUrl: z.string().url("Please enter a valid URL").optional(),
});

const ebookProductSchema = baseProductSchema.extend({
  downloadLink: z.string().url("Please enter a valid URL"),
  format: z.enum(["PDF", "EPUB", "MOBI", "ALL"]),
  pages: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(1, "Pages must be at least 1").optional()
  ),
});

const courseProductSchema = baseProductSchema.extend({
  streamingUrl: z.string().url("Please enter a valid URL").optional(),
  lessons: z.array(z.object({
    title: z.string().min(1, "Lesson title is required"),
    description: z.string().optional(),
    duration: z.string().optional(),
  })).min(1, "At least one lesson is required"),
});

const eventProductSchema = baseProductSchema.extend({
  price: z.preprocess(
    (val) => (val === "" ? 0 : Number(val)),
    z.number().optional()  // Make price optional for events
  ),
  eventDate: z.date(),
  eventLocation: z.string().min(3, "Event location is required"),
  maxAttendees: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(1, "Max attendees must be at least 1")
  ),
  tickets: z.array(z.object({
    name: z.string().min(1, "Ticket name is required"),
    price: z.preprocess(
      (val) => (val === "" ? undefined : Number(val)),
      z.number().min(0, "Price must be non-negative")
    ),
    available: z.preprocess(
      (val) => (val === "" ? undefined : Number(val)),
      z.number().min(1, "Available tickets must be at least 1")
    ),
  })).min(1, "At least one ticket type is required"),
});

const membershipProductSchema = baseProductSchema.extend({
  duration: z.string().min(1, "Duration is required"),
  benefits: z.array(z.string()).min(1, "At least one benefit is required"),
  subscriptionType: z.enum(["MONTHLY", "YEARLY", "LIFETIME"]),
});

const callProductSchema = baseProductSchema.extend({
  callDuration: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(15, "Call duration must be at least 15 minutes")
  ),
  availability: z.enum(["DAILY", "WEEKLY", "MONTHLY", "CUSTOM"]),
});

const coffeeProductSchema = baseProductSchema.extend({
  suggestedAmounts: z.array(
    z.preprocess(
      (val) => (val === "" ? undefined : Number(val)),
      z.number().min(1, "Amount must be at least 1")
    )
  ).optional(),
  customMessage: z.string().optional(),
});

// Steps component similar to create-listing
function Steps({ steps, currentStep }) {
  return (
    <div className="w-full overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center">
            <div 
              className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-xs sm:text-sm font-medium ${
                currentStep >= step.id 
                  ? "bg-primary text-white" 
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {currentStep > step.id ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : step.id}
            </div>
            <span className="mt-1 text-[10px] sm:text-xs font-medium hidden sm:block">
              {step.title}
            </span>
          </div>
        ))}
      </div>
      <div className="relative h-1 bg-muted rounded-full mt-1 mb-4 sm:mb-6">
        <div 
          className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}

// ProductTypeSelector Component
function ProductTypeSelector({ onSelect }) {
  const productTypes = [
    { 
      type: 'DIGITAL', 
      name: 'Digital product', 
      description: 'Any set of files to download or stream.',
      icon: <File className="h-8 w-8 text-pink-500" />
    },
    { 
      type: 'EBOOK', 
      name: 'E-book', 
      description: 'Offer a book or comic in PDF, ePub, and Mobi formats.',
      icon: <BookOpen className="h-8 w-8 text-amber-500" />
    },
    { 
      type: 'COURSE', 
      name: 'Course or tutorial', 
      description: 'Sell a single lesson or teach a whole cohort of students.',
      icon: <Video className="h-8 w-8 text-teal-500" />
    },
    { 
      type: 'MEMBERSHIP', 
      name: 'Membership', 
      description: 'Start a membership business around your fans.',
      icon: <Users className="h-8 w-8 text-yellow-500" />
    },
    { 
      type: 'BUNDLE', 
      name: 'Bundle', 
      description: 'Sell two or more existing products for a new price',
      icon: <Package className="h-8 w-8 text-purple-500" />
    },
    { 
      type: 'EVENT', 
      name: 'Event/Ticket', 
      description: 'Sell tickets to an event, conference, or concert',
      icon: <Ticket className="h-8 w-8 text-blue-500" />
    },
    { 
      type: 'CALL', 
      name: 'Coaching call', 
      description: 'Offer one-on-one video calls with your audience',
      icon: <Video className="h-8 w-8 text-cyan-500" />
    },
    { 
      type: 'COFFEE', 
      name: 'Buy me a coffee', 
      description: 'Let your audience support you with small contributions',
      icon: <Coffee className="h-8 w-8 text-red-500" />
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">What are you selling?</h2>
        <p className="text-muted-foreground">Choose the type of product you want to create</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {productTypes.map(product => (
          <Card 
            key={product.type}
            className="overflow-hidden cursor-pointer hover:border-primary hover:shadow-md transition-all duration-200 ease-in-out"
            onClick={() => onSelect(product.type)}
          >
            <CardContent className="p-4 flex flex-col items-start gap-3 group">
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                {product.icon}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Dynamic form fields based on product type
function ProductFormFields({ productType, register, formState, watch, setValue, getValues }) {
  const { errors } = formState;
  
  // File upload state
  const [isUploading, setIsUploading] = useState(false);
  const { edgestore } = useEdgeStore();
  
  // For courses with multiple lessons
  const [lessons, setLessons] = useState([{ title: '', description: '', duration: '' }]);
  
  // For memberships with benefits
  const [benefits, setBenefits] = useState(['']);
  
  // For events with tickets
  const [tickets, setTickets] = useState(() => {
    // Initialize from form values if they exist, otherwise use default
    const existingTickets = watch('tickets') || [];
    return existingTickets.length > 0 ? existingTickets : [{
      name: 'General Admission',
      price: 0,
      available: 100,
      transferable: false,
      limitPerBuyer: false,
      maxPerBuyer: 1
    }];
  });
  
  // For coffee donations
  const [suggestedAmounts, setSuggestedAmounts] = useState([5, 10, 15]);
  
  // Handle file upload - will be used in ContentBlocks, not here
  const handleFileUpload = async (files) => {
    setIsUploading(true);
    try {
      if (files.length === 0) return;
      
      // Upload the first file
      const res = await edgestore.publicFiles.upload({
        file: files[0],
        onProgressChange: (progress) => {
          console.log(`Upload progress: ${progress}%`);
        },
      });
      
      toast.success('File uploaded successfully');
      return res.url;
    } catch (error) {
      toast.error('Failed to upload file');
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle adding/removing lessons for courses
  const addLesson = () => {
    setLessons([...lessons, { title: '', description: '', duration: '' }]);
  };
  
  const removeLesson = (index) => {
    const updatedLessons = [...lessons];
    updatedLessons.splice(index, 1);
    setLessons(updatedLessons);
    setValue('lessons', updatedLessons);
  };
  
  // Handle adding/removing benefits for memberships
  const addBenefit = () => {
    setBenefits([...benefits, '']);
  };
  
  const removeBenefit = (index) => {
    const updatedBenefits = [...benefits];
    updatedBenefits.splice(index, 1);
    setBenefits(updatedBenefits);
    setValue('benefits', updatedBenefits);
  };
  
  // Handle adding/removing tickets for events
  const addTicket = () => {
    setTickets(prev => [...prev, {
      name: '',
      price: 0,
      available: 100,
      transferable: false,
      limitPerBuyer: false,
      maxPerBuyer: 1
    }]);
  };
  
  const removeTicket = (index) => {
    setTickets(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };
  
  // Update suggested amounts for coffee donations
  const updateAmount = (index, value) => {
    const updatedAmounts = [...suggestedAmounts];
    updatedAmounts[index] = Number(value);
    setSuggestedAmounts(updatedAmounts);
    setValue('suggestedAmounts', updatedAmounts);
  };
  
  // Update the form whenever tickets change
  useEffect(() => {
    setValue('tickets', tickets);
  }, [tickets, setValue]);
  
  // Modified ticket update function with validation
  const updateTicket = (index, field, value) => {
    setTickets(prev => {
      const updated = [...prev];
      
      // Handle numeric fields
      if (field === 'price') {
        const parsed = parseFloat(value);
        updated[index][field] = isNaN(parsed) ? 0 : Math.max(0, parsed);
      }
      else if (field === 'available' || field === 'maxPerBuyer') {
        const parsed = parseInt(value);
        updated[index][field] = isNaN(parsed) ? 1 : Math.max(1, parsed);
      }
      // Handle boolean fields
      else if (field === 'transferable' || field === 'limitPerBuyer') {
        updated[index][field] = Boolean(value);
        // Reset maxPerBuyer if limitPerBuyer is turned off
        if (field === 'limitPerBuyer' && !value) {
          updated[index].maxPerBuyer = 1;
        }
      }
      // Handle string fields
      else {
        updated[index][field] = value;
      }
      
      return updated;
    });
  };
  
  // Base fields all product types need
  const baseFields = (
    <>
      <div className="space-y-2">
        <Label htmlFor="title" className="text-base font-medium flex items-center gap-1">
          Product Name <span className="text-red-500">*</span>
        </Label>
        <Input 
          id="title" 
          placeholder="e.g. Creative Photography Masterclass" 
          className="h-11"
          {...register('title')} 
        />
        {errors.title && (
          <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {errors.title.message}
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description" className="text-base font-medium flex items-center gap-1">
          Description <span className="text-red-500">*</span>
        </Label>
        <Textarea 
          id="description" 
          placeholder="Describe your product in detail" 
          rows={5}
          className="resize-y min-h-[120px]"
          {...register('description')} 
        />
        {errors.description && (
          <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {errors.description.message}
          </p>
        )}
      </div>
      
      {/* Only show price field for non-EVENT product types */}
      {productType !== 'EVENT' && (
        <div className="space-y-2">
          <Label htmlFor="price" className="text-base font-medium flex items-center gap-1">
            Price <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              id="price" 
              placeholder="29.99" 
              className="pl-10 h-11"
              type="number"
              step="0.01"
              min="0"
              {...register('price')} 
            />
          </div>
          {errors.price && (
            <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {errors.price.message}
            </p>
          )}
        </div>
      )}
    </>
  );
  
  // Render different fields based on product type - without file uploads
  switch (productType) {
    case 'DIGITAL':
      return (
        <Card className="border rounded-lg shadow-sm bg-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-950/30">
                <File className="h-6 w-6 text-pink-500" />
              </div>
              <div>
                <CardTitle className="text-xl">Digital Product Details</CardTitle>
                <CardDescription>Fill in the details about your digital product</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 px-6">
            {baseFields}
          </CardContent>
        </Card>
      );
      
    case 'EBOOK':
      return (
        <Card className="border rounded-lg shadow-sm bg-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-950/30">
                <BookOpen className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <CardTitle className="text-xl">E-book Details</CardTitle>
                <CardDescription>Fill in the details about your e-book</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 px-6">
            {baseFields}
            
            <div className="space-y-2">
              <Label htmlFor="format">Format <span className="text-red-500">*</span></Label>
              <Select 
                onValueChange={(value) => setValue('format', value)}
                defaultValue="ALL"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF only</SelectItem>
                  <SelectItem value="EPUB">EPUB only</SelectItem>
                  <SelectItem value="MOBI">MOBI only</SelectItem>
                  <SelectItem value="ALL">All formats (PDF, EPUB, MOBI)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pages">Number of Pages</Label>
              <Input 
                id="pages" 
                type="number"
                min="1"
                placeholder="e.g. 256" 
                {...register('pages')} 
              />
            </div>
          </CardContent>
        </Card>
      );
      
    case 'COURSE':
      return (
        <Card className="border rounded-lg shadow-sm bg-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-950/30">
                <Video className="h-6 w-6 text-teal-500" />
              </div>
              <div>
                <CardTitle className="text-xl">Course Details</CardTitle>
                <CardDescription>Create your online course or tutorial</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 px-6">
            {baseFields}
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium flex items-center gap-1">
                  Course Lessons <span className="text-red-500">*</span>
                </Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addLesson}
                  className="gap-1 h-9"
                >
                  <Plus className="h-4 w-4" /> Add Lesson
                </Button>
              </div>
              
              <div className="space-y-4">
                {lessons.map((lesson, index) => (
                  <Card key={index} className="overflow-hidden border border-border/60">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full text-primary text-sm font-semibold">
                            {index + 1}
                          </span>
                          Lesson {index + 1}
                        </h4>
                        {lessons.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLesson(index)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor={`lessons[${index}].title`}>Title <span className="text-red-500">*</span></Label>
                          <Input
                            id={`lessons[${index}].title`}
                            placeholder="e.g. Introduction to Photography"
                            value={lesson.title}
                            onChange={e => {
                              const updatedLessons = [...lessons];
                              updatedLessons[index].title = e.target.value;
                              setLessons(updatedLessons);
                              setValue(`lessons[${index}].title`, e.target.value);
                            }}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`lessons[${index}].description`}>Description</Label>
                          <Textarea
                            id={`lessons[${index}].description`}
                            placeholder="What will students learn in this lesson?"
                            value={lesson.description}
                            onChange={e => {
                              const updatedLessons = [...lessons];
                              updatedLessons[index].description = e.target.value;
                              setLessons(updatedLessons);
                              setValue(`lessons[${index}].description`, e.target.value);
                            }}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`lessons[${index}].duration`}>Duration</Label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id={`lessons[${index}].duration`}
                              placeholder="e.g. 45 minutes"
                              className="pl-10"
                              value={lesson.duration}
                              onChange={e => {
                                const updatedLessons = [...lessons];
                                updatedLessons[index].duration = e.target.value;
                                setLessons(updatedLessons);
                                setValue(`lessons[${index}].duration`, e.target.value);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {errors.lessons && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {errors.lessons.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Streaming URL (optional)</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="e.g. https://yourvideo.com/stream"
                  className="pl-10"
                  {...register('streamingUrl')}
                />
              </div>
              {errors.streamingUrl && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {errors.streamingUrl.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      );
      
    case 'MEMBERSHIP':
      return (
        <Card className="border rounded-lg shadow-sm bg-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-950/30">
                <Users className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <CardTitle className="text-xl">Membership Details</CardTitle>
                <CardDescription>Fill in the details about your membership</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 px-6">
            {baseFields}
            
            <div className="space-y-2">
              <Label htmlFor="subscriptionType">Subscription Type <span className="text-red-500">*</span></Label>
              <Select 
                onValueChange={(value) => setValue('subscriptionType', value)}
                defaultValue="MONTHLY"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                  <SelectItem value="LIFETIME">One-time Purchase (Lifetime)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Membership Duration <span className="text-red-500">*</span></Label>
              <Input 
                id="duration" 
                placeholder="e.g. 1 month" 
                {...register('duration')} 
              />
              {errors.duration && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {errors.duration.message}
                </p>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Membership Benefits <span className="text-red-500">*</span></Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addBenefit}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Benefit
                </Button>
              </div>
              
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    placeholder={`Benefit ${index + 1}`}
                    value={benefit}
                    onChange={e => {
                      const updatedBenefits = [...benefits];
                      updatedBenefits[index] = e.target.value;
                      setBenefits(updatedBenefits);
                      setValue(`benefits[${index}]`, e.target.value);
                    }}
                  />
                  
                  {benefits.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBenefit(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              
              {errors.benefits && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {errors.benefits.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      );
      
    case 'EVENT':
      return (
        <Card className="border rounded-lg shadow-sm bg-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/30">
                <Ticket className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-xl">Event Details</CardTitle>
                <CardDescription>Fill in the details about your event</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 px-6">
            {baseFields}
            
            <div className="space-y-2">
              <Label htmlFor="eventDate">Event Date <span className="text-red-500">*</span></Label>
              <Input 
                id="eventDate" 
                type="datetime-local"
                min={new Date().toISOString().slice(0, 16)}
                {...register('eventDate', { 
                  setValueAs: (v) => v ? new Date(v) : undefined,
                  required: 'Event date is required'
                })}
              />
              {errors.eventDate && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {errors.eventDate.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="eventLocation">Event Location <span className="text-red-500">*</span></Label>
              <Input 
                id="eventLocation" 
                placeholder="e.g. Virtual or 123 Main St, City" 
                {...register('eventLocation', {
                  required: 'Event location is required'
                })} 
              />
              {errors.eventLocation && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {errors.eventLocation.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxAttendees">Maximum Attendees <span className="text-red-500">*</span></Label>
              <Input 
                id="maxAttendees" 
                type="number"
                min="1"
                placeholder="e.g. 100" 
                {...register('maxAttendees', {
                  required: 'Maximum attendees is required',
                  valueAsNumber: true,
                  validate: (value) => {
                    if (isNaN(value) || value < 1) return 'Must be a valid number greater than 0';
                    return true;
                  }
                })} 
              />
              {errors.maxAttendees && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {errors.maxAttendees.message}
                </p>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-lg font-medium flex items-center gap-1">
                    Ticket Types <span className="text-red-500">*</span>
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">Define ticket types for your event</p>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addTicket}
                  className="gap-1 h-9 whitespace-nowrap"
                >
                  <Plus className="h-4 w-4" /> Add Ticket Type
                </Button>
              </div>
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {tickets.map((ticket, index) => (
                  <Card key={index} className="overflow-hidden border-border/80 hover:border-primary/60 transition-colors">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full text-primary text-sm font-semibold">
                            {index + 1}
                          </span>
                          Ticket Type {index + 1}
                        </h4>
                        {tickets.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTicket(index)}
                            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor={`tickets.${index}.name`}>Name <span className="text-red-500">*</span></Label>
                          <Input
                            id={`tickets.${index}.name`}
                            placeholder="e.g. VIP Pass"
                            value={ticket.name}
                            onChange={e => updateTicket(index, 'name', e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`tickets.${index}.price`}>Price <span className="text-red-500">*</span></Label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              id={`tickets.${index}.price`}
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="e.g. 49.99"
                              className="pl-10"
                              value={ticket.price}
                              onChange={e => updateTicket(index, 'price', e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor={`tickets.${index}.available`}>Available <span className="text-red-500">*</span></Label>
                          <Input
                            id={`tickets.${index}.available`}
                            type="number"
                            min="1"
                            placeholder="e.g. 100"
                            value={ticket.available}
                            onChange={e => updateTicket(index, 'available', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="pt-1">
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                          <div className="flex items-center gap-2">
                            <Switch 
                              id={`tickets.${index}.transferable`}
                              checked={ticket.transferable}
                              onCheckedChange={(checked) => updateTicket(index, 'transferable', checked)}
                            />
                            <Label htmlFor={`tickets.${index}.transferable`} className="cursor-pointer text-sm">
                              Transferable
                            </Label>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Switch 
                              id={`tickets.${index}.limitPerBuyer`}
                              checked={ticket.limitPerBuyer}
                              onCheckedChange={(checked) => updateTicket(index, 'limitPerBuyer', checked)}
                            />
                            <Label htmlFor={`tickets.${index}.limitPerBuyer`} className="cursor-pointer text-sm">
                              Limit Per Buyer
                            </Label>
                          </div>
                        </div>
                        
                        {ticket.limitPerBuyer && (
                          <div className="mt-3">
                            <Label htmlFor={`tickets.${index}.maxPerBuyer`} className="text-sm">
                              Max Tickets Per Buyer
                            </Label>
                            <Input 
                              id={`tickets.${index}.maxPerBuyer`}
                              type="number"
                              min="1"
                              max={ticket.available}
                              className="mt-1 max-w-[140px]"
                              value={ticket.maxPerBuyer}
                              onChange={e => updateTicket(index, 'maxPerBuyer', e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      );
      
    case 'CALL':
      return (
        <Card className="border rounded-lg shadow-sm bg-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-950/30">
                <Video className="h-6 w-6 text-cyan-500" />
              </div>
              <div>
                <CardTitle className="text-xl">Coaching Call Details</CardTitle>
                <CardDescription>Fill in the details about your coaching call</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 px-6">
            {baseFields}
            
            <div className="space-y-2">
              <Label htmlFor="callDuration">Call Duration (minutes) <span className="text-red-500">*</span></Label>
              <Input 
                id="callDuration" 
                type="number"
                min="15"
                step="15"
                placeholder="e.g. 60" 
                {...register('callDuration')} 
              />
              {errors.callDuration && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {errors.callDuration.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="availability">Availability <span className="text-red-500">*</span></Label>
              <Select 
                onValueChange={(value) => setValue('availability', value)}
                defaultValue="WEEKLY"
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="CUSTOM">Custom Schedule</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      );
      
    case 'COFFEE':
      return (
        <Card className="border rounded-lg shadow-sm bg-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-950/30">
                <Coffee className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <CardTitle className="text-xl">Coffee Donation Details</CardTitle>
                <CardDescription>Fill in the details about your coffee donation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 px-6">
            {baseFields}
            
            <div className="space-y-2">
              <Label>Suggested Amounts</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input 
                  placeholder="Amount 1" 
                  type="number"
                  step="0.01"
                  value={suggestedAmounts[0]}
                  onChange={e => updateAmount(0, e.target.value)}
                />
                <Input 
                  placeholder="Amount 2" 
                  type="number"
                  step="0.01"
                  value={suggestedAmounts[1]}
                  onChange={e => updateAmount(1, e.target.value)}
                />
                <Input 
                  placeholder="Amount 3" 
                  type="number"
                  step="0.01"
                  value={suggestedAmounts[2]}
                  onChange={e => updateAmount(2, e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Custom Message</Label>
              <Textarea 
                id="customMessage" 
                placeholder="Add a custom message for your coffee donations" 
                rows={3}
                {...register('customMessage')} 
              />
            </div>
          </CardContent>
        </Card>
      );
      
    default:
      return null;
  }
}

// Product Settings Component
function ProductSettings({ register, watch, setValue }) {
  const settings = watch('settings') || {
    allowComments: true,
    showSales: true,
    isPrivate: false,
    allowReviews: true,
    paywallContent: true,
    showAuthor: true,
  };

  const updateSetting = (key, value) => {
    setValue(`settings.${key}`, value);
  };

  return (
    <Card className="border rounded-lg shadow-sm bg-card mt-6">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
            <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          <div>
            <CardTitle className="text-lg">Product Settings</CardTitle>
            <CardDescription>Configure how your product appears and functions</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 px-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="allowComments" className="cursor-pointer">Allow Comments</Label>
            <p className="text-xs text-muted-foreground">Let buyers leave comments on your product</p>
          </div>
          <Switch 
            id="allowComments"
            checked={settings.allowComments}
            onCheckedChange={(value) => updateSetting('allowComments', value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="showSales" className="cursor-pointer">Show Sales</Label>
            <p className="text-xs text-muted-foreground">Display how many times your product has been sold</p>
          </div>
          <Switch 
            id="showSales"
            checked={settings.showSales}
            onCheckedChange={(value) => updateSetting('showSales', value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="isPrivate" className="cursor-pointer">Private Product</Label>
            <p className="text-xs text-muted-foreground">Only accessible through direct link</p>
          </div>
          <Switch 
            id="isPrivate"
            checked={settings.isPrivate}
            onCheckedChange={(value) => updateSetting('isPrivate', value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="allowReviews" className="cursor-pointer">Allow Reviews</Label>
            <p className="text-xs text-muted-foreground">Let buyers rate and review your product</p>
          </div>
          <Switch 
            id="allowReviews"
            checked={settings.allowReviews}
            onCheckedChange={(value) => updateSetting('allowReviews', value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="paywallContent" className="cursor-pointer">Paywall Content</Label>
            <p className="text-xs text-muted-foreground">Require purchase to access full content</p>
          </div>
          <Switch 
            id="paywallContent"
            checked={settings.paywallContent}
            onCheckedChange={(value) => updateSetting('paywallContent', value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="showAuthor" className="cursor-pointer">Show Author</Label>
            <p className="text-xs text-muted-foreground">Display your profile as the author</p>
          </div>
          <Switch 
            id="showAuthor"
            checked={settings.showAuthor}
            onCheckedChange={(value) => updateSetting('showAuthor', value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Content Block Component
function ContentBlock({ block, index, updateBlock, removeBlock, moveBlock, isFirst, isLast }) {
  const renderBlockEditor = () => {
    switch (block.type) {
      case 'text':
        return (
          <div className="space-y-2">
            <Label htmlFor={`block-${index}-content`}>Text Content</Label>
            <Textarea 
              id={`block-${index}-content`}
              value={block.content}
              rows={4}
              placeholder="Enter text content..."
              onChange={(e) => updateBlock(index, { ...block, content: e.target.value })}
              className="min-h-[100px]"
            />
          </div>
        );
        
      case 'heading':
        return (
          <div className="space-y-2">
            <Label htmlFor={`block-${index}-content`}>Heading</Label>
            <Input 
              id={`block-${index}-content`}
              value={block.content}
              placeholder="Enter heading text..."
              onChange={(e) => updateBlock(index, { ...block, content: e.target.value })}
            />
            <div className="flex items-center justify-between mt-2">
              <Label htmlFor={`block-${index}-level`} className="text-xs">Heading Level</Label>
              <Select 
                value={block.level || 'h2'}
                onValueChange={(value) => updateBlock(index, { ...block, level: value })}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="h1">Heading 1</SelectItem>
                  <SelectItem value="h2">Heading 2</SelectItem>
                  <SelectItem value="h3">Heading 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
        
      case 'file':
        return (
          <div className="space-y-2">
            <Label>File Upload (Max 15MB)</Label>
            <FileUploader 
              onFilesSelected={(files) => {
                if (files.length > 0) {
                  // Handle file upload here
                  updateBlock(index, { 
                    ...block, 
                    fileName: files[0].name,
                    fileSize: files[0].size,
                    fileUrl: URL.createObjectURL(files[0])
                  });
                }
              }}
              acceptedFileTypes={["*/*"]}
              maxFiles={1}
              maxSizeInMB={15}
              label={block.fileName || "Upload file"}
            />
            {block.fileName && (
              <div className="flex items-center gap-2 text-sm mt-2">
                <FileTextIcon className="h-4 w-4" />
                <span>{block.fileName}</span>
                <span className="text-muted-foreground">
                  ({Math.round(block.fileSize / 1024)} KB)
                </span>
              </div>
            )}
          </div>
        );
        
      case 'image':
        return (
          <div className="space-y-2">
            <Label>Image Upload</Label>
            <FileUploader 
              onFilesSelected={(files) => {
                if (files.length > 0) {
                  // Handle image upload here
                  updateBlock(index, { 
                    ...block, 
                    fileName: files[0].name,
                    fileSize: files[0].size,
                    fileUrl: URL.createObjectURL(files[0])
                  });
                }
              }}
              acceptedFileTypes={["image/*"]}
              maxFiles={1}
              maxSizeInMB={5}
              label={block.fileName || "Upload image"}
            />
            {block.fileUrl && (
              <div className="mt-2">
                <img 
                  src={block.fileUrl} 
                  alt={block.fileName} 
                  className="max-h-[200px] rounded-md object-contain"
                />
              </div>
            )}
            <Input 
              placeholder="Alt text (for accessibility)"
              value={block.altText || ''}
              onChange={(e) => updateBlock(index, { ...block, altText: e.target.value })}
              className="mt-2"
            />
          </div>
        );
        
      case 'link':
        return (
          <div className="space-y-2">
            <Label htmlFor={`block-${index}-url`}>External Link</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id={`block-${index}-url`}
                placeholder="https://..."
                className="pl-10"
                value={block.url || ''}
                onChange={(e) => updateBlock(index, { ...block, url: e.target.value })}
              />
            </div>
            <Label htmlFor={`block-${index}-text`} className="mt-2 block">Link Text</Label>
            <Input 
              id={`block-${index}-text`}
              placeholder="Click here"
              value={block.text || ''}
              onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
            />
          </div>
        );
        
      case 'video':
        return (
          <div className="space-y-2">
            <Label htmlFor={`block-${index}-url`}>Video URL</Label>
            <div className="relative">
              <Video className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                id={`block-${index}-url`}
                placeholder="https://youtube.com/... or https://vimeo.com/..."
                className="pl-10"
                value={block.url || ''}
                onChange={(e) => updateBlock(index, { ...block, url: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Input 
                placeholder="Width (px or %)"
                value={block.width || '100%'}
                onChange={(e) => updateBlock(index, { ...block, width: e.target.value })}
              />
              <Input 
                placeholder="Height (px)"
                value={block.height || '400px'}
                onChange={(e) => updateBlock(index, { ...block, height: e.target.value })}
              />
            </div>
          </div>
        );
        
      case 'question':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor={`block-${index}-question`}>Question Text</Label>
              <Input 
                id={`block-${index}-question`}
                value={block.question || ''}
                placeholder="Enter your question here..."
                onChange={(e) => updateBlock(index, { ...block, question: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor={`block-${index}-description`}>Description (Optional)</Label>
              <Textarea 
                id={`block-${index}-description`}
                value={block.description || ''}
                placeholder="Add additional context or instructions for this question..."
                onChange={(e) => updateBlock(index, { ...block, description: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor={`block-${index}-type`}>Answer Type</Label>
              <Select 
                value={block.questionType || 'TEXT'}
                onValueChange={(value) => updateBlock(index, { ...block, questionType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEXT">
                    <div className="flex items-center gap-2">
                      <Text className="h-4 w-4 text-slate-500" />
                      <span>Text</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="NUMBER">
                    <div className="flex items-center gap-2">
                      <Hash className="h-4 w-4 text-indigo-500" />
                      <span>Number</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="DATE">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-green-500" />
                      <span>Date</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-2">
                <Switch 
                  id={`block-${index}-required`}
                  checked={block.required || false}
                  onCheckedChange={(checked) => updateBlock(index, { ...block, required: checked })}
                />
                <Label htmlFor={`block-${index}-required`} className="cursor-pointer">Required</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch 
                  id={`block-${index}-public`}
                  checked={block.isPublic || false}
                  onCheckedChange={(checked) => updateBlock(index, { ...block, isPublic: checked })}
                />
                <Label htmlFor={`block-${index}-public`} className="cursor-pointer">Public Responses</Label>
              </div>
            </div>
          </div>
        );
        
      case 'tickets':
        return (
          <div className="space-y-4">
            <div>
              <Label>Ticket Information</Label>
              <p className="text-sm text-muted-foreground mt-1">
                When someone purchases this product, they will automatically receive unique ticket codes that can be scanned or verified at your event.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`block-${index}-eventDate`}>Event Date</Label>
                <Input 
                  id={`block-${index}-eventDate`}
                  type="datetime-local"
                  value={block.eventDate ? new Date(block.eventDate).toISOString().slice(0, 16) : ''}
                  onChange={(e) => updateBlock(index, { ...block, eventDate: e.target.value })}
                  disabled={block.isRequired}
                />
                {block.isRequired && (
                  <p className="text-xs text-muted-foreground mt-1">This is automatically synced with your event details</p>
                )}
              </div>
              
              <div>
                <Label htmlFor={`block-${index}-eventLocation`}>Event Location</Label>
                <Input 
                  id={`block-${index}-eventLocation`}
                  placeholder="e.g., Virtual or 123 Main St, City"
                  value={block.eventLocation || ''}
                  onChange={(e) => updateBlock(index, { ...block, eventLocation: e.target.value })}
                  disabled={block.isRequired}
                />
              </div>
            </div>
            
            {block.ticketTypes && block.ticketTypes.length > 0 ? (
              <div className="space-y-2">
                <Label>Ticket Types</Label>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {block.ticketTypes.map((ticket, ticketIndex) => (
                    <Card key={ticketIndex} className="overflow-hidden border-border/60">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Ticket className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">{ticket.name}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ${ticket.price} • {ticket.available} available
                          </div>
                        </div>
                        <div className="flex mt-2 gap-3 text-xs">
                          {ticket.transferable && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                              <Share2 className="h-3 w-3" /> Transferable
                            </span>
                          )}
                          {ticket.limitPerBuyer && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-full">
                              <Users className="h-3 w-3" /> Max {ticket.maxPerBuyer} per buyer
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  These ticket types are defined in your product details and will be available for purchase.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor={`block-${index}-ticketType`}>Ticket Type</Label>
                  <Input 
                    id={`block-${index}-ticketType`}
                    placeholder="e.g., General Admission, VIP, etc."
                    value={block.ticketType || ''}
                    onChange={(e) => updateBlock(index, { ...block, ticketType: e.target.value })}
                    disabled={block.isRequired}
                  />
                </div>
                
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <Switch 
                      id={`block-${index}-transferable`}
                      checked={block.transferable || false}
                      onCheckedChange={(checked) => updateBlock(index, { ...block, transferable: checked })}
                      disabled={block.isRequired}
                    />
                    <Label htmlFor={`block-${index}-transferable`} className="cursor-pointer">Transferable</Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch 
                      id={`block-${index}-limitPerBuyer`}
                      checked={block.limitPerBuyer || false}
                      onCheckedChange={(checked) => updateBlock(index, { ...block, limitPerBuyer: checked })}
                      disabled={block.isRequired}
                    />
                    <Label htmlFor={`block-${index}-limitPerBuyer`} className="cursor-pointer">Limit Per Buyer</Label>
                  </div>
                </div>
                
                {block.limitPerBuyer && (
                  <div>
                    <Label htmlFor={`block-${index}-maxPerBuyer`}>Max Tickets Per Buyer</Label>
                    <Input 
                      id={`block-${index}-maxPerBuyer`}
                      type="number"
                      min="1"
                      value={block.maxPerBuyer || 1}
                      onChange={(e) => updateBlock(index, { ...block, maxPerBuyer: parseInt(e.target.value) })}
                      disabled={block.isRequired}
                      className="max-w-[140px]"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        );
        
      default:
        return <p>Unknown block type</p>;
    }
  };

  return (
    <Card className="mb-4 border hover:border-border/80 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="cursor-grab h-7 w-7 p-0"
              title="Drag to reorder"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
            <div className="flex items-center gap-1.5">
              {block.type === 'text' && <Text className="h-4 w-4 text-slate-500" />}
              {block.type === 'heading' && <LayoutList className="h-4 w-4 text-blue-500" />}
              {block.type === 'file' && <FileTextIcon className="h-4 w-4 text-amber-500" />}
              {block.type === 'image' && <ImageIcon className="h-4 w-4 text-green-500" />}
              {block.type === 'link' && <ExternalLink className="h-4 w-4 text-purple-500" />}
              {block.type === 'video' && <Video className="h-4 w-4 text-red-500" />}
              {block.type === 'question' && <HelpCircle className="h-4 w-4 text-violet-500" />}
              {block.type === 'tickets' && <Ticket className="h-4 w-4 text-blue-500" />}
              <span className="font-medium capitalize">{block.type}</span>
              {block.isRequired && <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 rounded-full">Required</span>}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {!isFirst && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => moveBlock(index, index - 1)}
                title="Move up"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {!isLast && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => moveBlock(index, index + 1)}
                title="Move down"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            {!block.isRequired && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                onClick={() => removeBlock(index)}
                title="Remove block"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {renderBlockEditor()}
      </CardContent>
    </Card>
  );
}

// Product Content Component
function ProductContent({ contentBlocks, setContentBlocks }) {
  const addBlock = (type) => {
    const newBlock = { type, id: Date.now() };
    setContentBlocks([...contentBlocks, newBlock]);
  };

  const updateBlock = (index, updatedBlock) => {
    const updatedBlocks = [...contentBlocks];
    updatedBlocks[index] = updatedBlock;
    setContentBlocks(updatedBlocks);
  };

  const removeBlock = (index) => {
    const updatedBlocks = [...contentBlocks];
    updatedBlocks.splice(index, 1);
    setContentBlocks(updatedBlocks);
  };

  const moveBlock = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= contentBlocks.length) return;
    
    const updatedBlocks = [...contentBlocks];
    const [movedBlock] = updatedBlocks.splice(fromIndex, 1);
    updatedBlocks.splice(toIndex, 0, movedBlock);
    setContentBlocks(updatedBlocks);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Product Content</h2>
        <p className="text-muted-foreground">Create your product content using different block types</p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addBlock('text')}
          className="flex items-center gap-1"
        >
          <Text className="h-4 w-4" />
          <span>Text</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addBlock('heading')}
          className="flex items-center gap-1"
        >
          <LayoutList className="h-4 w-4" />
          <span>Heading</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addBlock('file')}
          className="flex items-center gap-1"
        >
          <FileTextIcon className="h-4 w-4" />
          <span>File</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addBlock('image')}
          className="flex items-center gap-1"
        >
          <ImageIcon className="h-4 w-4" />
          <span>Image</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addBlock('link')}
          className="flex items-center gap-1"
        >
          <ExternalLink className="h-4 w-4" />
          <span>Link</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addBlock('video')}
          className="flex items-center gap-1"
        >
          <Video className="h-4 w-4" />
          <span>Video</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addBlock('question')}
          className="flex items-center gap-1"
        >
          <HelpCircle className="h-4 w-4 text-purple-500" />
          <span>Question</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addBlock('tickets')}
          className="flex items-center gap-1"
        >
          <Ticket className="h-4 w-4 text-blue-500" />
          <span>Tickets</span>
        </Button>
      </div>
      
      <div className="mt-6">
        {contentBlocks.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-md border-border/60">
            <FilePenLine className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <p className="mt-2 text-muted-foreground">Add blocks to create your product content</p>
          </div>
        ) : (
          contentBlocks.map((block, index) => (
            <ContentBlock
              key={block.id}
              block={block}
              index={index}
              updateBlock={updateBlock}
              removeBlock={removeBlock}
              moveBlock={moveBlock}
              isFirst={index === 0}
              isLast={index === contentBlocks.length - 1}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Main page component
export default function EditProductPage({ params }) {
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const [currentStep, setCurrentStep] = useState(2) // Start at details step for editing
  const [productType, setProductType] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [contentBlocks, setContentBlocks] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Setup form with dynamic schema
  const { register, handleSubmit, formState, setValue, getValues, watch, reset } = useForm({
    resolver: zodResolver(getSchemaForProductType()),
    defaultValues: {
      settings: {
        allowComments: true,
        showSales: true,
        isPrivate: false,
        allowReviews: true,
        paywallContent: true,
        showAuthor: true,
      }
    }
  });

  // Load existing product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to load product');
        }
        
        const product = await response.json();
        
        // Set product type
        setProductType(product.type);
        
        // Set form values
        reset({
          title: product.title,
          description: product.description,
          price: product.price,
          eventDate: product.eventDate ? new Date(product.eventDate) : undefined,
          eventLocation: product.eventLocation,
          maxAttendees: product.maxAttendees,
          tickets: product.tickets,
          settings: {
            ...product.settings,
          },
          // Add other fields based on product type
          ...(product.type === 'EBOOK' && {
            format: product.format,
            pages: product.pages,
          }),
          ...(product.type === 'COURSE' && {
            lessons: product.lessons,
            streamingUrl: product.streamingUrl,
          }),
          // ... add other product type specific fields
        });
        
        // Set content blocks
        setContentBlocks(product.content || []);
        
      } catch (error) {
        toast.error('Failed to load product');
        console.error('Error loading product:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      loadProduct();
    }
  }, [params.id, reset]);

  // Modified submit handler for editing
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // For EVENT products, ensure price is 0 
      if (productType === 'EVENT') {
        data.price = 0;
        
        if (data.tickets) {
          data.tickets = data.tickets.map(ticket => ({
            name: ticket.name,
            price: parseFloat(ticket.price),
            available: parseInt(ticket.available),
            totalCount: parseInt(ticket.available),
            transferable: ticket.transferable || false,
            limitPerBuyer: ticket.limitPerBuyer || false,
            maxPerBuyer: ticket.limitPerBuyer ? (ticket.maxPerBuyer || 1) : 1
          }));
        }
      }
      
      // Combine data with product type and content blocks
      const productData = {
        ...data,
        type: productType,
        content: contentBlocks
      };
      
      // Send to API with PUT method for updating
      const response = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update product');
      }
      
      toast.success('Product updated successfully!');
      router.push(`/marketplace/products/${params.id}`);
      
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Modified steps for editing
  const STEPS = [
    { id: 2, title: "Product Details" },
    { id: 3, title: "Content" },
    { id: 4, title: "Review & Save" }
  ];

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  // Modified render content to skip type selection
  const renderStepContent = () => {
    switch (currentStep) {
      case 2:
        return (
          <div className="space-y-6">
            <ProductFormFields
              productType={productType}
              register={register}
              formState={formState}
              watch={watch}
              setValue={setValue}
              getValues={getValues}
            />
            <ProductSettings 
              register={register}
              watch={watch}
              setValue={setValue}
            />
          </div>
        );
      case 3:
        return (
          <ProductContent
            contentBlocks={contentBlocks}
            setContentBlocks={setContentBlocks}
          />
        );
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Review Changes</h2>
              <p className="text-muted-foreground">Review your changes before saving</p>
            </div>
            
            {/* Rest of the review content remains the same */}
            {/* ... */}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
        <Button
          variant="ghost"
          onClick={() => router.push(`/marketplace/products/${params.id}`)}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
      </div>
      
      <Steps steps={STEPS} currentStep={currentStep} />
      {renderStepContent()}
      
      <div className="mt-6 space-x-2">
        {currentStep > 2 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            Previous
          </Button>
        )}
        {currentStep < STEPS.length && (
          <Button
            type="button"
            onClick={() => {
              if (isStepValid()) {
                if (currentStep === STEPS.length) {
                  onSubmit(watch());
                } else {
                  handleNextStep();
                }
              }
            }}
            disabled={!isStepValid() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {currentStep === STEPS.length ? "Saving..." : "Processing..."}
              </>
            ) : (
              currentStep === STEPS.length ? "Save Changes" : "Next"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
