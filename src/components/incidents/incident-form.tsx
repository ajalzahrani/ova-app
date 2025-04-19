"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  incidentDate: z.date({
    required_error: "Incident date is required",
  }),
  incidentTime: z.string().min(1, {
    message: "Incident time is required",
  }),
  location: z.string().min(1, {
    message: "Location is required",
  }),
  incidentType: z.string({
    required_error: "Please select an incident type",
  }),
  severityLevel: z.string({
    required_error: "Please select a severity level",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters",
  }),
  witnessNames: z.string().optional(),
  actionsTaken: z.string().optional(),
})

export function IncidentForm() {
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      witnessNames: "",
      actionsTaken: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    toast({
      title: "Incident reported",
      description: "Your incident has been successfully reported",
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="incidentDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Incident Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="incidentTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Incident Time</FormLabel>
                <FormControl>
                  <Input type="time" placeholder="HH:MM" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Where did the incident occur?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="incidentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Incident Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select incident type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="verbal_abuse">Verbal Abuse</SelectItem>
                    <SelectItem value="physical_threat">Physical Threat</SelectItem>
                    <SelectItem value="physical_assault">Physical Assault</SelectItem>
                    <SelectItem value="harassment">Harassment</SelectItem>
                    <SelectItem value="bullying">Bullying</SelectItem>
                    <SelectItem value="property_damage">Property Damage</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="severityLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Severity Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Incident Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide a detailed description of what happened"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>Include what happened, who was involved, and any other relevant details</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="witnessNames"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Witness Names</FormLabel>
              <FormControl>
                <Input placeholder="Names of any witnesses (if applicable)" {...field} />
              </FormControl>
              <FormDescription>Separate multiple names with commas</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="actionsTaken"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Actions Taken</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe any immediate actions taken in response to the incident"
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full md:w-auto">
          Submit Report
        </Button>
      </form>
    </Form>
  )
}
