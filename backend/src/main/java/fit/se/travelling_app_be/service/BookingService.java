package fit.se.travelling_app_be.service;

import fit.se.travelling_app_be.entity.Booking;
import fit.se.travelling_app_be.entity.Destination;
import fit.se.travelling_app_be.repository.BookingRepository;
import fit.se.travelling_app_be.repository.DestinationRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {
    
    private final BookingRepository bookingRepository;
    private final DestinationRepository destinationRepository;
    private final MongoTemplate mongoTemplate;
    private final NotificationService notificationService;
    
    public Booking createBooking(Booking booking) {
        // Validate destination exists
        if (booking.getDestination() == null || booking.getDestination().getId() == null) {
            throw new RuntimeException("Booking must have a valid destination");
        }
        
        // Ensure destination exists in database before saving booking
        String destinationId = booking.getDestination().getId();
        Optional<Destination> destinationOpt = destinationRepository.findById(destinationId);
        if (destinationOpt.isEmpty()) {
            throw new RuntimeException("Destination not found: " + destinationId);
        }
        
        // Set the destination from repository to ensure it's properly managed
        Destination destination = destinationOpt.get();
        booking.setDestination(destination);
        
        // Set default values
        // If payment method is provided and booking is created, mark as CONFIRMED
        // In real app, this should be done after payment gateway confirmation
        if (booking.getPaymentMethod() != null && !booking.getPaymentMethod().isEmpty()) {
            booking.setStatus("CONFIRMED");
            booking.setPaymentStatus("PAID");
        } else {
            booking.setStatus("PENDING");
            booking.setPaymentStatus("PENDING");
        }
        booking.setBookingDate(LocalDateTime.now());
        
        // Save booking using repository first
        Booking savedBooking = bookingRepository.save(booking);
        String savedBookingId = savedBooking.getId();
        
        // CRITICAL: Always ensure destination is saved correctly by updating directly with MongoTemplate
        // This is a workaround for @DBRef serialization issues
        try {
            // Always update destination field directly to ensure it's saved correctly
            org.bson.Document destRef = new org.bson.Document();
            destRef.put("$ref", "destinations");
            destRef.put("$id", new org.bson.types.ObjectId(destinationId));
            
            // Update only the destination field
            org.bson.Document updateDoc = new org.bson.Document("$set", 
                new org.bson.Document("destination", destRef));
            
            org.bson.types.ObjectId bookingObjectId = new org.bson.types.ObjectId(savedBookingId);
            mongoTemplate.getCollection("bookings").updateOne(
                new org.bson.Document("_id", bookingObjectId),
                updateDoc
            );
            
            // Verify it was updated
            org.bson.Document verifyDoc = mongoTemplate.getCollection("bookings")
                .find(new org.bson.Document("_id", bookingObjectId))
                .first();
            
            if (verifyDoc != null && verifyDoc.containsKey("destination")) {
                System.out.println("✅ [BookingService] Booking " + savedBookingId + " destination field ensured (destinationId: " + destinationId + ")");
            } else {
                System.err.println("❌ [BookingService] FAILED to ensure destination for booking " + savedBookingId);
            }
        } catch (Exception e) {
            System.err.println("❌ [BookingService] ERROR ensuring destination for booking " + savedBookingId + ": " + e.getMessage());
            e.printStackTrace();
        }
        
        // Create notification for the user
        String destinationName = "Unknown Destination";
        if (booking.getDestination() != null && booking.getDestination().getName() != null) {
            destinationName = booking.getDestination().getName();
        }
        
        String status = savedBooking.getStatus().equals("CONFIRMED") ? "đã xác nhận" : "đang chờ xử lý";
        notificationService.createNotification(
            booking.getUserId(),
            "Đặt chỗ thành công!",
            "Chuyến đi đến " + destinationName + " của bạn " + status + ".",
            "booking",
            savedBooking.getId()
        );
        
        return savedBooking;
    }
    
    public List<Booking> getAllBookings() {
        // Query raw documents to avoid conversion error
        List<org.bson.Document> bookingDocs = mongoTemplate.getCollection("bookings")
            .find()
            .into(new java.util.ArrayList<>());
        
        // Convert documents to Booking objects and populate destination
        return convertBookingDocuments(bookingDocs);
    }
    
    public List<Booking> getBookingsByUserId(String userId) {
        // Query raw documents to avoid conversion error
        List<org.bson.Document> bookingDocs = mongoTemplate.getCollection("bookings")
            .find(new org.bson.Document("userId", userId))
            .into(new java.util.ArrayList<>());
        
        // Convert documents to Booking objects and populate destination
        return convertBookingDocuments(bookingDocs);
    }
    
    private List<Booking> convertBookingDocuments(List<org.bson.Document> bookingDocs) {
        return bookingDocs.stream().map(doc -> {
            try {
                Booking booking = new Booking();
                booking.setId(doc.getObjectId("_id").toString());
                booking.setUserId(doc.getString("userId"));
                booking.setStatus(doc.getString("status"));
                booking.setNumberOfTravelers(doc.getInteger("numberOfTravelers"));
                booking.setPaymentMethod(doc.getString("paymentMethod"));
                booking.setPaymentStatus(doc.getString("paymentStatus"));
                
                // Handle dates
                if (doc.getDate("bookingDate") != null) {
                    booking.setBookingDate(doc.getDate("bookingDate").toInstant()
                        .atZone(java.time.ZoneId.systemDefault())
                        .toLocalDateTime());
                }
                if (doc.getDate("travelDate") != null) {
                    booking.setTravelDate(doc.getDate("travelDate").toInstant()
                        .atZone(java.time.ZoneId.systemDefault())
                        .toLocalDateTime());
                }
                if (doc.getDate("createdAt") != null) {
                    booking.setCreatedAt(doc.getDate("createdAt").toInstant()
                        .atZone(java.time.ZoneId.systemDefault())
                        .toLocalDateTime());
                }
                if (doc.getDate("updatedAt") != null) {
                    booking.setUpdatedAt(doc.getDate("updatedAt").toInstant()
                        .atZone(java.time.ZoneId.systemDefault())
                        .toLocalDateTime());
                }
                
                // Handle totalPrice
                if (doc.get("totalPrice") != null) {
                    Object priceObj = doc.get("totalPrice");
                    if (priceObj instanceof Number) {
                        booking.setTotalPrice(java.math.BigDecimal.valueOf(((Number) priceObj).doubleValue()));
                    }
                }
                
                // Handle specialRequests
                if (doc.get("specialRequests") != null) {
                    List<?> requests = doc.getList("specialRequests", Object.class);
                    if (requests != null) {
                        booking.setSpecialRequests(requests.stream()
                            .map(Object::toString)
                            .collect(Collectors.toList()));
                    }
                }
                
                // Handle contactInfo - skip for now as it's package-private
                // ContactInfo will be null, which is acceptable for now
                
                // Populate destination from ObjectId or DBRef
                String extractedDestinationId = null;
                
                // Check if destinationId field exists separately (some bookings might have this)
                if (doc.containsKey("destinationId")) {
                    Object destIdObj = doc.get("destinationId");
                    if (destIdObj instanceof String) {
                        extractedDestinationId = (String) destIdObj;
                    } else if (destIdObj instanceof ObjectId) {
                        extractedDestinationId = ((ObjectId) destIdObj).toString();
                    }
                }
                
                if (doc.containsKey("destination")) {
                    Object destinationObj = doc.get("destination");
                    
                    try {
                        // Handle com.mongodb.DBRef object (MongoDB driver converts DBRef to this type)
                        if (destinationObj instanceof com.mongodb.DBRef) {
                            com.mongodb.DBRef dbRef = (com.mongodb.DBRef) destinationObj;
                            Object idObj = dbRef.getId();
                            if (idObj instanceof ObjectId) {
                                extractedDestinationId = ((ObjectId) idObj).toString();
                            } else if (idObj instanceof org.bson.Document) {
                                // Nested ObjectId format: {"$id": {"$oid": "..."}}
                                org.bson.Document oidDoc = (org.bson.Document) idObj;
                                if (oidDoc.containsKey("$oid")) {
                                    Object oidValue = oidDoc.get("$oid");
                                    if (oidValue instanceof ObjectId) {
                                        extractedDestinationId = ((ObjectId) oidValue).toString();
                                    } else {
                                        extractedDestinationId = oidValue.toString();
                                    }
                                }
                            } else if (idObj != null) {
                                extractedDestinationId = idObj.toString();
                            }
                        }
                        // Handle DBRef format: {"$ref": "destinations", "$id": ObjectId("...")}
                        else if (destinationObj instanceof org.bson.Document) {
                            org.bson.Document destDoc = (org.bson.Document) destinationObj;
                            
                            // Check if it's a DBRef (has $ref and $id)
                            if (destDoc.containsKey("$ref") && destDoc.containsKey("$id")) {
                                Object idObj = destDoc.get("$id");
                                if (idObj instanceof ObjectId) {
                                    extractedDestinationId = ((ObjectId) idObj).toString();
                                } else if (idObj instanceof org.bson.Document) {
                                    // Nested ObjectId format: {"$id": {"$oid": "..."}}
                                    org.bson.Document oidDoc = (org.bson.Document) idObj;
                                    if (oidDoc.containsKey("$oid")) {
                                        Object oidValue = oidDoc.get("$oid");
                                        if (oidValue instanceof ObjectId) {
                                            extractedDestinationId = ((ObjectId) oidValue).toString();
                                        } else {
                                            extractedDestinationId = oidValue.toString();
                                        }
                                    }
                                } else if (idObj != null) {
                                    extractedDestinationId = idObj.toString();
                                }
                            } 
                            // Check if destination is already populated (has id field)
                            else if (destDoc.containsKey("id")) {
                                extractedDestinationId = destDoc.getString("id");
                            } 
                            // Check for _id field
                            else if (destDoc.containsKey("_id")) {
                                Object idObj = destDoc.get("_id");
                                if (idObj instanceof ObjectId) {
                                    extractedDestinationId = ((ObjectId) idObj).toString();
                                } else if (idObj instanceof String) {
                                    extractedDestinationId = (String) idObj;
                                }
                            }
                        } 
                        // Handle direct ObjectId
                        else if (destinationObj instanceof ObjectId) {
                            extractedDestinationId = ((ObjectId) destinationObj).toString();
                        } 
                        // Handle String
                        else if (destinationObj instanceof String) {
                            extractedDestinationId = (String) destinationObj;
                        }
                        // Fallback: try JSON parsing
                        else {
                            try {
                                String destinationJson = null;
                                if (destinationObj instanceof org.bson.Document) {
                                    destinationJson = ((org.bson.Document) destinationObj).toJson();
                                }
                                
                                if (destinationJson != null) {
                                    ObjectMapper mapper = new ObjectMapper();
                                    JsonNode jsonNode = mapper.readTree(destinationJson);
                                    
                                    if (jsonNode.has("$id")) {
                                        JsonNode idNode = jsonNode.get("$id");
                                        if (idNode.has("$oid")) {
                                            extractedDestinationId = idNode.get("$oid").asText();
                                        } else if (idNode.isTextual()) {
                                            extractedDestinationId = idNode.asText();
                                        }
                                    } else if (jsonNode.has("id")) {
                                        extractedDestinationId = jsonNode.get("id").asText();
                                    }
                                }
                            } catch (Exception jsonEx) {
                                // Ignore JSON parsing errors, we'll log below
                            }
                        }
                    } catch (Exception e) {
                        System.err.println("❌ [BookingService] Error extracting destination ID for booking: " + booking.getId() + " - " + e.getMessage());
                    }
                } else {
                    System.err.println("⚠️ [BookingService] Booking document has no 'destination' field (Booking ID: " + booking.getId() + ")");
                }
                
                // Try to populate destination if we have destinationId
                if (extractedDestinationId != null && !extractedDestinationId.isEmpty()) {
                    try {
                        Optional<Destination> destinationOpt = destinationRepository.findById(extractedDestinationId);
                        if (destinationOpt.isPresent()) {
                            booking.setDestination(destinationOpt.get());
                        } else {
                            System.err.println("❌ [BookingService] Destination not found for ID: " + extractedDestinationId + " (Booking: " + booking.getId() + ")");
                        }
                    } catch (Exception e) {
                        System.err.println("❌ [BookingService] Error fetching destination: " + e.getMessage());
                    }
                } else {
                    // Log detailed info for debugging
                    if (doc.containsKey("destination")) {
                        Object destObj = doc.get("destination");
                        System.err.println("⚠️ [BookingService] Booking " + booking.getId() + " has destination field but couldn't extract ID. Type: " + 
                            (destObj != null ? destObj.getClass().getName() : "null") + ", Value: " + destObj);
                    } else {
                        System.err.println("⚠️ [BookingService] Booking " + booking.getId() + " has no destination field");
                    }
                }
                
                return booking;
            } catch (Exception e) {
                System.err.println("Error converting booking document: " + e.getMessage());
                e.printStackTrace();
                return null;
            }
        }).filter(booking -> booking != null).collect(Collectors.toList());
    }
    
    public List<Booking> getActiveBookingsByUserId(String userId) {
        return bookingRepository.findActiveBookingsByUserId(userId);
    }
    
    public List<Booking> getUpcomingBookings(String userId) {
        return bookingRepository.findByUserIdAndStatus(userId, "CONFIRMED");
    }
    
    public List<Booking> getCompletedBookings(String userId) {
        return bookingRepository.findByUserIdAndStatus(userId, "COMPLETED");
    }
    
    public Optional<Booking> findById(String id) {
        return bookingRepository.findById(id);
    }
    
    public Booking updateBookingStatus(String id, String status) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        booking.setStatus(status);
        return bookingRepository.save(booking);
    }
    
    public Booking updatePaymentStatus(String id, String paymentStatus) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        booking.setPaymentStatus(paymentStatus);
        return bookingRepository.save(booking);
    }
    
    public void cancelBooking(String id) {
        Booking booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);
    }
}
