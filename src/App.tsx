import React from "react";

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      fontFamily: 'system-ui'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#059669', marginBottom: '1rem' }}>
          ✅ React is Working!
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
          Basic React component is rendering successfully.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer'
          }}
        >
          Refresh
        </button>
      </div>
    </div>
  );
      <ErrorBoundary level="app">
        <AuthErrorBoundary>
          <AuthProvider>
            <CartProvider>
              <Router>
                <ScrollToTop />
                <OAuthRedirectHandler />
                <div className="min-h-screen bg-gray-50">
                  <ErrorBoundary level="page">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/books" element={<BookListing />} />
                      <Route path="/books/:id" element={<BookDetails />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                      />
                      <Route
                        path="/reset-password"
                        element={<ResetPassword />}
                      />
                      <Route path="/confirm" element={<Confirm />} />
                      <Route path="/verify" element={<Verify />} />
                      <Route
                        path="/confirm-email-change"
                        element={<ConfirmEmailChange />}
                      />
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/policies" element={<Policies />} />
                      <Route path="/contact" element={<ContactUs />} />
                      <Route path="/report" element={<Report />} />
                      <Route path="/shipping" element={<Shipping />} />
                      <Route
                        path="/university-info"
                        element={<UniversityInfo />}
                      />
                      <Route
                        path="/university-profile"
                        element={<ModernUniversityProfile />}
                      />
                      <Route
                        path="/university-profile-legacy"
                        element={<UniversityProfile />}
                      />
                      <Route
                        path="/university/:universityId"
                        element={<ModernUniversityProfile />}
                      />
                      <Route
                        path="/university/:universityId/faculty/:facultyId"
                        element={<FacultyDetail />}
                      />
                      <Route
                        path="/university/:universityId/faculty/:facultyId/course/:courseId"
                        element={<CourseDetail />}
                      />
                      <Route
                        path="/study-resources"
                        element={<StudyResources />}
                      />
                      <Route path="/add-program" element={<AddProgram />} />

                      {/* Public user profiles - no authentication required */}
                      <Route path="/user/:id" element={<UserProfile />} />

                      {/* Protected Routes */}
                      <Route
                        path="/profile"
                        element={
                          <ProtectedRoute>
                            <Profile />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/create-listing"
                        element={
                          <ProtectedRoute>
                            <CreateListing />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/checkout/:id"
                        element={
                          <ProtectedRoute>
                            <Checkout />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/activity"
                        element={
                          <ProtectedRoute>
                            <ActivityLog />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/notifications"
                        element={
                          <ProtectedRoute>
                            <Notifications />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/cart"
                        element={
                          <ProtectedRoute>
                            <Cart />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/edit-book/:id"
                        element={
                          <ProtectedRoute>
                            <EditBook />
                          </ProtectedRoute>
                        }
                      />

                      {/* Admin Routes */}
                      <Route
                        path="/admin"
                        element={
                          <AdminProtectedRoute>
                            <Admin />
                          </AdminProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/reports"
                        element={
                          <AdminProtectedRoute>
                            <AdminReports />
                          </AdminProtectedRoute>
                        }
                      />

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </ErrorBoundary>
                </div>
                {/* TEMPORARY: Disabled to fix error spam */}
                {/* <BroadcastManager /> */}
                {process.env.NODE_ENV === "development" && (
                  <>{/* Debug components removed from production */}</>
                )}
              </Router>
            </CartProvider>
          </AuthProvider>
          {/* Vercel Analytics and Speed Insights */}
          {(() => {
            try {
              return (
                <>
                  <Analytics />
                  <SpeedInsights />
                </>
              );
            } catch (error) {
              console.warn("Vercel components failed to load:", error);
              return null;
            }
          })()}
        </AuthErrorBoundary>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error("❌ Error in App component:", error);
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui",
          background: "#f9fafb",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "2rem",
            background: "white",
            borderRadius: "0.5rem",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h1 style={{ color: "#dc2626", marginBottom: "1rem" }}>App Error</h1>
          <p>The application failed to load properly.</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: "#3b82f6",
              color: "white",
              padding: "0.75rem 1.5rem",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              marginTop: "1rem",
            }}
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
}

export default App;