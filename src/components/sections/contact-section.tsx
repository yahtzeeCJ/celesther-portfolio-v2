
"use client";

import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Mail, Phone, MapPin, Send, Linkedin, Github } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { submitContactForm } from '@/app/actions';
import ScrollAnimationWrapper from '@/components/scroll-animation-wrapper';
import { DiscordIcon } from '@/components/icons/discord-icon';
import EditableTextInline from '@/components/editable-text-inline';
import DraggableNativeElement from '@/components/admin/draggable-native-element';
import { useAdmin } from '@/contexts/AdminContext';
import type { SiteContent } from '@/types/content';


const contactSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  subject: z.string().min(5, { message: "Subject must be at least 5 characters." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const staticContactInfoData = [
  { icon: <Mail className="h-5 w-5 text-primary-foreground" />, titleKey: 'contactInfoEmailTitle' as keyof SiteContent, valueKey: 'contactInfoEmailValue' as keyof SiteContent, hrefPrefix: 'mailto:' },
  { icon: <Phone className="h-5 w-5 text-primary-foreground" />, titleKey: 'contactInfoCallTitle' as keyof SiteContent, valueKey: 'contactInfoCallValue' as keyof SiteContent, hrefPrefix: 'tel:' },
  { icon: <MapPin className="h-5 w-5 text-primary-foreground" />, titleKey: 'contactInfoLocationTitle' as keyof SiteContent, valueKey: 'contactInfoLocationValue' as keyof SiteContent, hrefPrefix: undefined },
];

const staticSocialLinksData = [
  { href: 'https://www.linkedin.com/in/celesther-john-lutche-788994369', icon: <Linkedin className="h-5 w-5" />, ariaLabelKey: 'contactSocialLinkedinAriaLabel' as keyof SiteContent },
  { href: 'https://github.com/yahtzeeCJ', icon: <Github className="h-5 w-5" />, ariaLabelKey: 'contactSocialGithubAriaLabel' as keyof SiteContent },
  { href: 'https://discord.com/users/858980553221734400', icon: <DiscordIcon className="h-5 w-5" />, ariaLabelKey: 'contactSocialDiscordAriaLabel' as keyof SiteContent },
];


export default function ContactSection() {
  const { toast } = useToast();
  const { siteContent } = useAdmin();
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit: SubmitHandler<ContactFormValues> = async (data) => {
    try {
      const result = await submitContactForm(data);
      if (result.success) {
        toast({
          title: "Message Sent!",
          description: "Thanks for reaching out. I'll get back to you soon.",
        });
        form.reset();
      } else {
        throw new Error(result.error || "Failed to send message.");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error instanceof Error ? error.message : "There was a problem with your request.",
      });
    }
  };

  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-4 relative">
        <ScrollAnimationWrapper className="text-center mb-16 relative min-h-[150px]">
          <DraggableNativeElement id="contactTitleWrapper_canvas" label="Contact Title" section="contact" defaultX={50} defaultY={0} defaultZ={10}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-headline inline-block">
              <EditableTextInline contentKey="contactSectionTitle" as="span">
                {siteContent.contactSectionTitle}
              </EditableTextInline>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mt-4">
              <EditableTextInline contentKey="contactSectionDescription" as="span" inputClassName="text-muted-foreground">
                {siteContent.contactSectionDescription}
              </EditableTextInline>
            </p>
            <div className="w-20 h-1 bg-primary mx-auto mt-4"></div>
          </DraggableNativeElement>
        </ScrollAnimationWrapper>

        <ScrollAnimationWrapper className="max-w-4xl mx-auto bg-card/80 border border-border rounded-xl overflow-hidden shadow-lg">
          <div className="md:flex">
            <div className="md:w-1/3 bg-primary/10 p-8">
              <h3 className="text-xl font-bold text-foreground mb-6 font-headline">
                <EditableTextInline contentKey="contactInfoTitle" as="span">
                  {siteContent.contactInfoTitle}
                </EditableTextInline>
              </h3>
              <div className="space-y-6 mb-8">
                {staticContactInfoData.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="ml-4">
                      <h4 className="text-foreground font-medium">
                        <EditableTextInline contentKey={item.titleKey} as="span">
                          {siteContent[item.titleKey] as string}
                        </EditableTextInline>
                      </h4>
                      {item.hrefPrefix ? (
                        <a
                          href={`${item.hrefPrefix}${siteContent[item.valueKey]}`}
                          className="text-muted-foreground hover:text-primary transition text-sm break-all"
                        >
                          <EditableTextInline contentKey={item.valueKey} as="span" inputClassName="text-sm">
                            {siteContent[item.valueKey] as string}
                          </EditableTextInline>
                        </a>
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          <EditableTextInline contentKey={item.valueKey} as="span" inputClassName="text-sm">
                            {siteContent[item.valueKey] as string}
                          </EditableTextInline>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="text-xl font-bold text-foreground mb-4 font-headline">
                <EditableTextInline contentKey="contactFollowMeTitle" as="span">
                  {siteContent.contactFollowMeTitle}
                </EditableTextInline>
              </h3>
              <div className="flex space-x-3">
                {staticSocialLinksData.map((link) => (
                  <a
                    key={siteContent[link.ariaLabelKey] as string || link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={siteContent[link.ariaLabelKey] as string}
                    className="w-10 h-10 rounded-full bg-muted hover:bg-primary flex items-center justify-center text-muted-foreground hover:text-primary-foreground transition"
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>

            <div className="md:w-2/3 p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <EditableTextInline contentKey="contactFormNameLabel" as="span">
                              {siteContent.contactFormNameLabel}
                            </EditableTextInline>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} className="bg-background focus:ring-primary focus:border-transparent" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            <EditableTextInline contentKey="contactFormEmailLabel" as="span">
                              {siteContent.contactFormEmailLabel}
                            </EditableTextInline>
                          </FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john@example.com" {...field} className="bg-background focus:ring-primary focus:border-transparent" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <EditableTextInline contentKey="contactFormSubjectLabel" as="span">
                            {siteContent.contactFormSubjectLabel}
                          </EditableTextInline>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="How can I help you?" {...field} className="bg-background focus:ring-primary focus:border-transparent" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          <EditableTextInline contentKey="contactFormMessageLabel" as="span">
                            {siteContent.contactFormMessageLabel}
                          </EditableTextInline>
                        </FormLabel>
                        <FormControl>
                          <Textarea rows={4} placeholder="I'm interested in..." {...field} className="bg-background focus:ring-primary focus:border-transparent" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={form.formState.isSubmitting} className="group">
                    {form.formState.isSubmitting ? "Sending..." : "Send Message"}
                    {!form.formState.isSubmitting && <Send className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                  </Button>
                </form>
              </Form>
            </div>
          </div>
        </ScrollAnimationWrapper>
      </div>
    </section>
  );
}

