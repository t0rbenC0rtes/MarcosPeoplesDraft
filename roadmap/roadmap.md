# Updated Roadmap: marcospeoples.com
## Interactive Memorial Website for Marcos Peebles
### September 29, 1972 - December 12, 2025

**Last Updated:** December 26, 2025  
**Status:** Phase 1.1 Complete - Ready for Phase 1.2

---

## CONFIRMED PROJECT DECISIONS

✅ **Domain**: marcospeoples.com  
✅ **Full Name**: Marcos Peebles  
✅ **Timeline**: September 29, 1972 - December 12, 2025  
✅ **Access**: Open to anyone who visits  
✅ **Moderation**: Trust-based, no pre-moderation, post-moderation available  
✅ **Authentication**: Dual system (Google OAuth OR anonymous guest)  
✅ **Expected Users**: 50-150 contributors, multiple memories each  
✅ **Geographic Focus**: International - Brussels, London, Santiago de Chile  
✅ **Languages**: English (UK), French (BE), Spanish (CL), Dutch (BE), Portuguese (BR)  
✅ **Translation**: Memory translation feature required  
✅ **Notifications**: Email alerts to moderators for new memories  
✅ **Budget**: $25/month Supabase (100GB storage)  
✅ **Timeline**: ~2 months solo development, no deadline  
✅ **Lifespan**: Permanent memorial

---

## **Phase 1: Planning & Design** (2-3 weeks)

### 1.1 Project Definition ✅ COMPLETE
- ✅ Define objectives, scope, and moderation rules
- ✅ Identify target users and their needs
- ✅ Set technical limits (max photos per memory, file sizes)
- ✅ Confirm authentication approach

### 1.2 Information Architecture (NEXT)
- Structure data model (memories, users, locations, media)
  - **New**: User profiles (Google OAuth vs. anonymous)
  - **New**: Authentication state management
- Define metadata and taxonomy
- Plan navigation flows
- Design database schema with dual authentication support

### 1.3 UX/UI Design
- Create wireframes and high-fidelity mockups
- Design system (colors, typography, components)
  - **Consider**: Memorial-appropriate color palette
  - **Include**: Google sign-in button design
  - **Include**: Anonymous login interface
- Define map interactions (zoom, clustering, animations)
- Create interactive prototype
- Design contributor profiles (Google vs. anonymous display)

---

## **Phase 2: Infrastructure Setup** (1-2 weeks)

### 2.1 Development Environment
- Initialize React project with Vite
- Configure folder structure and dev tools (ESLint, Prettier)
- Set up Git repository
- Install authentication libraries (Google OAuth)

### 2.2 Supabase Configuration
- Create Supabase project
- Design database schema:
  - **Users table**: id, auth_type (google/anonymous), google_id, email, name, profile_pic_url, created_at
  - **Memories table**: id, user_id, title, story, language (en/fr/es/nl/pt), location, coordinates, created_at, updated_at, is_hidden
  - **Media table**: id, memory_id, file_url, thumbnail_url, order, created_at
  - **Reports table** (for post-moderation): id, memory_id, reporter_id, reason, status, created_at, reviewed_at, reviewed_by
  - **Translations table** (cache): id, memory_id, target_language, translated_title, translated_story, created_at
  - **Moderators table**: id, user_id, email, notification_enabled, created_at
- Configure RLS policies:
  - Read: Public access to all published memories (where is_hidden = false)
  - Write: Authenticated users (both Google and anonymous) can create
  - Update/Delete: Users can only modify their own content OR moderators
  - Moderators: Full access to all tables
- Set up Storage buckets for images
- Configure Google OAuth provider in Supabase Auth
- Set up email notifications (Supabase Edge Functions)

### 2.3 Vercel Setup
- Connect repository to Vercel
- Configure environments (dev, staging, production)
- Set environment variables:
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY
  - VITE_GOOGLE_CLIENT_ID (for OAuth)
- Configure custom domain (marcospeoples.com)

---

## **Phase 3: Core Development** (4-6 weeks)

### 3.1 Frontend Foundation
- Create base React component structure
- Implement routing (React Router)
- Set up state management (Context API or Zustand)
- Create custom Supabase hooks
- **NEW**: Build authentication system
  - Google OAuth integration
  - Anonymous login flow
  - Session persistence
  - User state management

### 3.2 Authentication Components
- **Google Login Component**
  - "Sign in with Google" button
  - OAuth redirect flow
  - Profile data capture (name, email, picture)
- **Anonymous Login Component**
  - Simple name input form
  - Temporary session creation
  - Anonymous user identifier
- **User Profile Display**
  - Show Google profile picture OR anonymous avatar
  - Display contributor name
  - Badge/indicator for auth type (optional)
- **Auth Context Provider**
  - Track current user state
  - Provide auth methods throughout app
  - Handle session expiration

### 3.3 Interactive Map
- Integrate map library (Mapbox GL or Leaflet)
- Implement geographical clustering system
- Develop progressive zoom logic
- Create markers/bubbles with counters
- Handle detail levels based on zoom
- Color-code markers by time period (optional: 1970s, 80s, 90s, 2000s, etc.)

### 3.4 Memory Visualization
- Develop detailed memory view (modal/page)
- Create photo gallery with navigation
- Implement text/testimony display
- Add author information with profile picture
- Display location information
- Build thumbnails with lazy loading
- Show timestamp and authentication badge

### 3.5 Content Submission System
- Create memory submission form
- Implement map location selector (click on map)
- Develop multi-photo upload with preview
- Add field validation
- Handle client-side image compression
- **NEW**: Check user authentication before submission
- **NEW**: Attach user profile to memory (Google data OR anonymous name)
- Immediate publication upon successful upload (no approval queue)

---

## **Phase 4: Backend & Integration** (2-3 weeks)

### 4.1 API & Database
- Create Supabase Edge Functions for:
  - User creation/authentication
  - Memory submission
  - Report handling
- Implement queries to fetch memories by geographical zone
- Optimize queries with proper indexing
- Build geolocation system (GPS coordinates)
- **NEW**: Handle both Google and anonymous user creation

### 4.2 Media Management
- Implement upload to Supabase Storage
- Create thumbnail generation system
- Set up CDN for images
- Handle responsive image resolutions
- Automatic compression for files > 2MB

### 4.3 Security & Validation
- Implement server-side data validation
- Configure file size and format limits
- Add basic anti-spam protection (rate limiting)
- **NEW**: Validate user authentication tokens
- **NEW**: Prevent anonymous session hijacking
- Set up logging system for submissions
- IP tracking for security (not displayed publicly)

---

## **Phase 5: Advanced Features** (2-3 weeks)

### 5.1 Enhanced UX
- Add smooth animations and transitions
- Implement search/filters:
  - By date range (based on Marcos's timeline)
  - By author name
  - By location
  - By keyword in story
  - By language
- Create timeline view (1972-2025)
  - Visual representation of memories across decades
  - Filter by year/decade
- Add fullscreen mode for photo gallery
- Implement "return to map" navigation

### 5.2 Multilingual Features
- **Language Detection**: Automatically detect memory language when submitted
- **Translation System**: 
  - Integrate translation API (Google Translate or DeepL)
  - "Translate this memory" button on each memory
  - Translate between: English (UK), French (BE), Spanish (CL), Dutch (BE), Portuguese (BR)
  - Cache translations to reduce API calls
  - Display original language indicator
- **UI Language Switcher**:
  - Interface translations for navigation/buttons
  - User preference persistence
  - Language-specific formatting (dates, numbers)

### 5.3 Moderator Notifications
- **Email System Setup**:
  - Use Supabase Edge Functions + email service (Resend, SendGrid, or similar)
  - Template for new memory notification
  - Include: contributor name, memory title, location, link to memory
- **Notification Settings**:
  - Moderator list management
  - Opt-in/opt-out per moderator
  - Digest option (daily summary vs. immediate)
  - Test notification system

### 5.4 Post-Moderation Features
- **Simple reporting system**:
  - "Report this memory" button (available to all users)
  - Report reasons dropdown (inappropriate, spam, false, other)
  - Submit report form
- **Moderator dashboard** (optional for Phase 5):
  - View reported memories
  - Review memory details and reports
  - Actions: dismiss report, hide memory, delete memory
  - Send notification to original contributor if removed
- **Content actions**:
  - Hide memory (soft delete - keeps in DB, removes from public)
  - Permanent delete option
  - Restore hidden memories

### 5.5 Social Features (optional)
- Share specific memory (direct link with preview)
  - Generate shareable URL for each memory
  - Social media meta tags for rich previews
  - Multi-language support in meta tags
- Simple reaction system on memories (hearts, optional)
- Comment threads on memories (OPTIONAL - may add later)

---

## **Phase 6: Optimization & Performance** (1-2 weeks)

### 6.1 Frontend Performance
- Optimize bundle size:
  - Code splitting by route
  - Lazy loading components
  - Tree shaking unused code
- Implement data caching (React Query or SWR)
- Optimize map rendering for large datasets (1000+ memories)
- Improve Core Web Vitals (LCP, FID, CLS)
- Prefetch images on hover

### 6.2 Backend Performance
- Optimize database queries:
  - Add composite indexes
  - Implement pagination (20 memories per load)
  - Cache frequent queries
- Configure Vercel edge caching
- Optimize image loading (WebP format, responsive sizes)
- Set up CDN for static assets

### 6.3 Responsive & Accessibility
- Ensure full mobile compatibility (320px - 768px)
- Test across browsers (Chrome, Firefox, Safari, Edge)
- Improve accessibility:
  - WCAG 2.1 Level AA compliance
  - ARIA labels for interactive elements
  - Keyboard navigation (tab through memories, map controls)
  - Screen reader compatibility
  - Alt text for images
- Optimize touch interactions (map panning, photo swiping)

---

## **Phase 7: Testing & QA** (1-2 weeks)

### 7.1 Functionality Testing
- **Authentication testing**:
  - Google OAuth flow (login, logout, session persistence)
  - Anonymous login flow
  - Session expiration handling
  - Edge cases (multiple tabs, browser refresh)
- Memory submission testing:
  - Both auth types can submit
  - File uploads (various formats, sizes)
  - Location selection
  - Form validation
  - Image compression
- Memory retrieval and display
- Map interactions (zoom, clustering, marker clicks)
- Search and filter functionality
- Reporting system

### 7.2 Performance Testing
- Load testing with simulated data (500-1000 memories)
- Map performance with clustering
- Image loading optimization
- Database query performance
- Mobile network performance (3G, 4G)

### 7.3 Security Testing
- Test RLS policies (users can't modify others' memories)
- File upload restrictions
- Rate limiting effectiveness
- SQL injection prevention (Supabase handles this)
- XSS prevention
- Authentication token security

### 7.4 Cross-Platform Testing
- Desktop browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Android)
- Tablet views (iPad, Android tablets)
- Different screen sizes and orientations

### 7.5 User Acceptance Testing
- Test with small group of family/friends
- Gather feedback on:
  - Emotional appropriateness
  - Ease of submission
  - Memory discovery
  - Overall experience
- Iterate based on feedback

---

## **Phase 8: Launch Preparation** (1 week)

### 8.1 Initial Content
- Create 5-10 sample memories (with permission from family)
  - Variety of locations
  - Different time periods (1970s-2025)
  - Mix of photo counts (1 photo, multiple photos)
  - Both Google and anonymous contributors (for testing)
- Write homepage/introduction:
  - About Marcos
  - Purpose of the site
  - Instructions on how to contribute
  - Dates: September 29, 1972 - December 12, 2025
- Create "How to Share a Memory" guide
  - Step-by-step with screenshots
  - Google login vs. anonymous explanation
  - Tips for writing meaningful memories

### 8.2 Legal & Ethics
- Draft privacy policy:
  - What data we collect (Google profile data, IP addresses)
  - How data is used
  - Data retention
  - Right to request deletion
- Draft terms of use:
  - Acceptable content guidelines
  - Photo rights and permissions
  - Reporting process
  - Disclaimer about user-generated content
- Create photo upload consent message:
  - "I confirm I have the right to share these photos"
  - "I grant permission for display on marcospeoples.com"
- Add legal footer links

### 8.3 Final Deployment
- Production configuration on Vercel
- Verify all environment variables
- Configure marcospeoples.com domain:
  - DNS settings
  - SSL certificate
  - WWW redirect
- Set up automatic Supabase backups (daily)
- Configure error monitoring (Sentry or similar)
- Set up analytics (optional - privacy-conscious choice)

---

## **Phase 9: Launch** (1 week)

### 9.1 Soft Launch
- Deploy to production
- Share with immediate family first (5-10 people)
- Monitor for issues:
  - Authentication problems
  - Submission failures
  - Map performance
  - Image uploads
- Collect initial feedback
- Make any urgent fixes

### 9.2 Official Launch
- Announce to extended family and friends
- Share on social media (if appropriate)
- Send email announcement with:
  - Link to marcospeoples.com
  - Brief explanation of purpose
  - Encouragement to share memories
  - Instructions on how to contribute
- Monitor site traffic and performance

### 9.3 Post-Launch Support
- Be available for user questions
- Monitor for any reported content
- Address technical issues quickly
- Celebrate milestone submissions (10th memory, 50th, 100th)

---

## **Phase 10: Maintenance** (ongoing)

### 10.1 Monitoring
- Monitor errors and performance (Vercel Analytics)
- Track Supabase usage:
  - Storage usage (images)
  - Database size
  - Bandwidth
  - Auth requests
- Check costs monthly (may need to upgrade from free tier)
- Monitor reported content (if any)

### 10.2 Content Moderation
- Review any reported memories within 48 hours
- Take action if needed (hide/delete)
- Communicate with contributors about removed content
- Document moderation decisions

### 10.3 Backups & Security
- Verify automatic backups running (daily)
- Test backup restoration quarterly
- Keep dependencies updated (security patches)
- Renew SSL certificate (automatic with Vercel)

### 10.4 Improvements
- Collect ongoing user feedback
- Implement requested features
- Optimize based on usage patterns
- Add memories from family over time

---

## **Overall Timeline**

- **Phase 1 (Planning & Design)**: 2-3 weeks
- **Phase 2 (Infrastructure)**: 1-2 weeks
- **Phase 3 (Core Development)**: 4-6 weeks
- **Phase 4 (Backend)**: 2-3 weeks
- **Phase 5 (Advanced Features)**: 2-3 weeks
- **Phase 6 (Optimization)**: 1-2 weeks
- **Phase 7 (Testing)**: 1-2 weeks
- **Phase 8 (Launch Prep)**: 1 week
- **Phase 9 (Launch)**: 1 week

**Total Duration**: 3-4 months (12-16 weeks)

---

## **Budget Estimates**

### Supabase (Database & Storage)
- **Confirmed Plan**: Pro Tier - $25/month
  - **Storage**: 100 GB
  - **Bandwidth**: 250 GB/month
  - **Suitable for**: 750+ memories with aggressive compression
- **Storage Strategy**: 
  - Compress all images to ~1.5 MB max
  - Use WebP format where supported
  - Generate thumbnails for gallery views
- **Expected Usage**:
  - 150-750 memories (50-150 contributors × 3-5 memories avg)
  - ~300 MB - 1.5 GB storage (well within 100GB limit)

### Vercel (Hosting)
- **Free Tier**: 100 GB bandwidth, unlimited requests
  - Suitable for expected traffic
- **Expected**: Free tier sufficient for entire project lifecycle

### Domain (marcospeoples.com)
- **Cost**: ~$12-15/year
- **Registrar**: Namecheap, Google Domains, or Cloudflare

### Total Annual Cost
- **Year 1**: ~$312-315 (Supabase $300 + domain $12-15)
- **Ongoing**: ~$312/year (Supabase $300 + domain renewal)
- **Note**: May be able to optimize to free Supabase tier if compression is aggressive enough

---

## **Technology Stack Summary**

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Context API or Zustand
- **Map**: Mapbox GL JS or Leaflet
- **UI Components**: Custom + Tailwind CSS
- **Authentication**: Supabase Auth (Google OAuth + Anonymous)

### Backend
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth
- **API**: Supabase Edge Functions (if needed)
- **Translation**: Google Translate API or DeepL API
- **Email**: Resend, SendGrid, or Supabase Edge Functions with SMTP

### Deployment
- **Hosting**: Vercel
- **Domain**: marcospeoples.com
- **CDN**: Vercel Edge Network
- **SSL**: Automatic via Vercel

### Development Tools
- **Version Control**: Git + GitHub
- **Code Quality**: ESLint, Prettier
- **Testing**: Vitest, React Testing Library
- **Error Tracking**: Sentry (optional)

---

## **Critical Success Factors**

1. **Respectful Design**: Interface appropriate for memorial context
2. **Trust-Based System**: Immediate publishing builds community trust
3. **Dual Authentication**: Lowers barrier to contribution (anonymous option)
4. **Performance**: Site must load quickly even with many memories
5. **Mobile-First**: Most users will access on phones
6. **Backups**: Robust system to never lose memories
7. **Scalability**: Design for hundreds/thousands of memories from start
8. **Emotional Safety**: Post-moderation available if needed, but trust first

---

## **Risk Mitigation**

| Risk | Mitigation Strategy |
|------|-------------------|
| Inappropriate content posted | Reporting system + responsive moderation |
| Site overwhelmed by traffic | Vercel auto-scales, caching strategies |
| Storage costs exceed budget | Compress images aggressively, monitor usage |
| Anonymous spam submissions | Rate limiting by IP, simple CAPTCHA if needed |
| Google OAuth failures | Always offer anonymous fallback |
| Loss of data | Automated daily backups, export functionality |
| Domain/hosting expires | Set up auto-renewal, calendar reminders |

---

## **Next Steps**

1. ✅ Complete Phase 1.1 (Project Definition)
2. ➡️ **Begin Phase 1.2**: Information Architecture
   - Design complete database schema
   - Plan authentication flows
   - Create sitemap and navigation structure
3. Identify moderators (who will handle reports if they occur)
4. Gather initial sample memories from family
5. Register marcospeoples.com domain

---

**Document Owner**: [Your Name]  
**Last Updated**: December 26, 2025  
**Next Review**: Start of Phase 1.2
