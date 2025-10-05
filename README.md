# Jobfinder - Career Path Project

A comprehensive job portal platform that connects job seekers with employers, featuring advanced CV analysis, job matching, and analytics dashboard.

## 🚀 Features

### For Job Seekers
- **User Registration & Authentication**: Secure signup and login with JWT tokens
- **Job Discovery**: Browse and search through available job postings
- **CV Upload & Analysis**: Upload resumes and get detailed analysis with ratings
- **Job Applications**: Apply to jobs with resume submission
- **Real-time Notifications**: Get notified about new job postings
- **Profile Management**: Manage personal information and application history

### For Recruiters
- **Company Dashboard**: Post and manage job listings
- **Application Management**: Review and manage job applications
- **Analytics Dashboard**: View detailed analytics on job performance and applications
- **Candidate Evaluation**: Access to CV analysis and ratings

### Core Features
- **Advanced CV Scanner**: AI-powered resume analysis and scoring
- **Responsive Design**: Modern, mobile-friendly interface with animations
- **Real-time Notifications**: Live updates on new job postings
- **Secure File Upload**: Support for PDF, DOCX, and image files
- **Role-based Access Control**: Different permissions for job seekers and recruiters

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks and concurrent features
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library for smooth interactions
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Hook Form** - Form management
- **Chart.js** - Data visualization
- **React Toastify** - Notification system

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **PDF-parse & Mammoth** - Document parsing for CV analysis
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Rate Limiting** - API rate limiting

## 📁 Project Structure

```
Carrier_Path Project/
├── Clients/                 # Frontend React Application
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── Components/     # Reusable UI components
│   │   ├── Pages/          # Page components
│   │   ├── assets/         # Images and media
│   │   └── main.jsx        # App entry point
│   ├── package.json
│   └── vite.config.js
├── Server/                  # Backend Node.js Application
│   ├── Controllers/        # Route controllers
│   ├── Models/            # MongoDB schemas
│   ├── Routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── Uploads/           # File uploads directory
│   ├── index.js           # Server entry point
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Carrier_Path Project"
   ```

2. **Backend Setup**
   ```bash
   cd Server
   npm install
   ```

   Create a `.env` file in the Server directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/jobfinder
   JWT_SECRET=your-super-secret-jwt-key
   PORT=5040
   NODE_ENV=development
   ```

3. **Frontend Setup**
   ```bash
   cd ../Clients
   npm install
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Start the Applications**

   **Terminal 1 - Backend:**
   ```bash
   cd Server
   npm run dev
   ```
   Server will run on `http://localhost:5040`

   **Terminal 2 - Frontend:**
   ```bash
   cd Clients
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

## 📖 Usage

### For Job Seekers

1. **Sign Up**: Create an account using the registration form
2. **Complete Profile**: Add personal information and upload your CV
3. **Browse Jobs**: Explore available job postings on the home page
4. **Apply**: Click on jobs and submit applications with your resume
5. **Track Applications**: View your application history and status
6. **Get CV Analysis**: Use the CV Scanner to get detailed feedback on your resume

### For Recruiters

1. **Register**: Sign up as a recruiter
2. **Post Jobs**: Create job listings with detailed requirements
3. **Manage Applications**: Review incoming applications and CVs
4. **View Analytics**: Access dashboard with application statistics
5. **Contact Candidates**: Reach out to potential hires

## 🔗 API Endpoints

### Authentication
- `POST /api/jobseeker/signup` - Job seeker registration
- `POST /api/jobseeker/login` - Job seeker login
- `POST /api/recruiter/signup` - Recruiter registration
- `POST /api/recruiter/login` - Recruiter login

### Jobs
- `GET /api/jobs/public` - Get all public job listings
- `POST /api/jobs` - Create new job (Recruiter only)
- `PUT /api/jobs/:id` - Update job (Recruiter only)
- `DELETE /api/jobs/:id` - Delete job (Recruiter only)

### Applications
- `POST /api/applications` - Submit job application
- `GET /api/applications` - Get applications (Recruiter only)

### CV Analysis
- `POST /api/cvscanner/scan` - Analyze uploaded CV
- `GET /api/cvs/rating/:id` - Get CV rating

### Analytics
- `GET /api/analytics/overview` - Get dashboard analytics
- `GET /api/analytics/jobs` - Job performance metrics

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface with consistent branding
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Smooth Animations**: Framer Motion powered transitions and interactions
- **Dark/Light Themes**: Consistent color scheme with green-to-teal gradients
- **Interactive Elements**: Hover effects, loading states, and micro-interactions
- **Accessibility**: Proper ARIA labels and keyboard navigation support

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Server-side validation with express-validator
- **File Upload Security**: Restricted file types and size limits
- **CORS Configuration**: Controlled cross-origin access
- **Helmet Security Headers**: Security headers for production

## 📊 Database Schema

### Users (Job Seekers & Recruiters)
```javascript
{
  name: String,
  email: String,
  password: String, // hashed
  role: String, // 'user' or 'recruiter'
  profile: {
    phone: String,
    location: String,
    skills: [String],
    experience: String
  }
}
```

### Jobs
```javascript
{
  title: String,
  companyName: String,
  description: String,
  requirements: [String],
  location: String,
  salary: String,
  postedBy: ObjectId, // Recruiter reference
  applications: [ObjectId], // Application references
  companyImage: String,
  createdAt: Date
}
```

### Applications
```javascript
{
  jobId: ObjectId,
  applicantId: ObjectId,
  resume: String, // file path
  status: String, // 'pending', 'reviewed', 'accepted', 'rejected'
  appliedAt: Date
}
```

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd Server
npm test

# Frontend tests
cd Clients
npm test
```

## 🚀 Deployment

### Backend Deployment
1. Set environment variables for production
2. Use a process manager like PM2
3. Configure MongoDB Atlas for cloud database
4. Set up file storage (AWS S3, Cloudinary, etc.)

### Frontend Deployment
1. Build the production bundle:
   ```bash
   cd Clients
   npm run build
   ```
2. Deploy to hosting service (Vercel, Netlify, etc.)
3. Configure environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Support

For support, email support@jobfinder.com or join our Discord community.

## 🙏 Acknowledgments

- React and Vite teams for excellent documentation
- Tailwind CSS for the utility-first approach
- Framer Motion for smooth animations
- The open-source community for inspiration and tools

---

**Built with ❤️ for connecting talent with opportunity**