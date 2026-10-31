package fit.se.travelling_app_be.service;

import fit.se.travelling_app_be.entity.Booking;
import fit.se.travelling_app_be.entity.Destination;
import fit.se.travelling_app_be.model.Notification;
import fit.se.travelling_app_be.repository.BookingRepository;
import fit.se.travelling_app_be.repository.DestinationRepository;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private DestinationRepository destinationRepository;

    @Mock
    private MongoTemplate mongoTemplate;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private BookingService bookingService;

    private Booking testBooking;
    private Destination testDestination;
    private String testBookingId;
    private String testUserId;
    private String testDestinationId;

    @BeforeEach
    void setUp() {
        testBookingId = "507f1f77bcf86cd799439011"; // Valid 24-char ObjectId
        testUserId = "507f1f77bcf86cd799439012"; // Valid 24-char ObjectId
        testDestinationId = "507f1f77bcf86cd799439013"; // Valid 24-char ObjectId

        testDestination = new Destination();
        testDestination.setId(testDestinationId);
        testDestination.setName("Test Destination");
        testDestination.setPrice(new BigDecimal("1000000"));

        testBooking = new Booking();
        testBooking.setId(testBookingId);
        testBooking.setUserId(testUserId);
        testBooking.setDestination(testDestination);
        testBooking.setStatus("PENDING");
        testBooking.setPaymentStatus("PENDING");
        testBooking.setNumberOfTravelers(2);
        testBooking.setTotalPrice(new BigDecimal("2000000"));
        testBooking.setTravelDate(LocalDateTime.now().plusDays(7));
    }

    @Test
    void testCreateBooking_WithValidDestination() {
        // Given
        when(destinationRepository.findById(testDestinationId)).thenReturn(Optional.of(testDestination));
        when(bookingRepository.save(any(Booking.class))).thenReturn(testBooking);
        
        // Mock MongoTemplate operations
        @SuppressWarnings("unchecked")
        com.mongodb.client.MongoCollection<Document> mockCollection = mock(com.mongodb.client.MongoCollection.class);
        when(mongoTemplate.getCollection("bookings")).thenReturn(mockCollection);
        @SuppressWarnings("unchecked")
        com.mongodb.client.FindIterable<Document> mockFindIterable = mock(com.mongodb.client.FindIterable.class);
        when(mockCollection.find(any(Document.class))).thenReturn(mockFindIterable);
        
        Notification mockNotification = new Notification();
        when(notificationService.createNotification(
            anyString(), anyString(), anyString(), anyString(), anyString()
        )).thenReturn(mockNotification);

        // When
        Booking result = bookingService.createBooking(testBooking);

        // Then
        assertNotNull(result);
        assertEquals(testBookingId, result.getId());
        verify(destinationRepository, times(1)).findById(testDestinationId);
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    void testCreateBooking_WithNullDestination() {
        // Given
        testBooking.setDestination(null);

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            bookingService.createBooking(testBooking);
        });
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void testCreateBooking_WithInvalidDestination() {
        // Given
        when(destinationRepository.findById(testDestinationId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            bookingService.createBooking(testBooking);
        });
        verify(destinationRepository, times(1)).findById(testDestinationId);
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    void testCreateBooking_WithPaymentMethod() {
        // Given
        testBooking.setPaymentMethod("Thẻ tín dụng");
        when(destinationRepository.findById(testDestinationId)).thenReturn(Optional.of(testDestination));
        when(bookingRepository.save(any(Booking.class))).thenReturn(testBooking);
        
        // Mock MongoTemplate operations
        @SuppressWarnings("unchecked")
        com.mongodb.client.MongoCollection<Document> mockCollection = mock(com.mongodb.client.MongoCollection.class);
        when(mongoTemplate.getCollection("bookings")).thenReturn(mockCollection);
        @SuppressWarnings("unchecked")
        com.mongodb.client.FindIterable<Document> mockFindIterable = mock(com.mongodb.client.FindIterable.class);
        when(mockCollection.find(any(Document.class))).thenReturn(mockFindIterable);
        
        Notification mockNotification = new Notification();
        when(notificationService.createNotification(
            anyString(), anyString(), anyString(), anyString(), anyString()
        )).thenReturn(mockNotification);

        // When
        Booking result = bookingService.createBooking(testBooking);

        // Then
        assertNotNull(result);
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    void testGetAllBookings() {
        // Given
        List<Document> bookingDocs = new ArrayList<>();
        Document bookingDoc = new Document("_id", new ObjectId(testBookingId))
            .append("userId", testUserId)
            .append("status", "PENDING")
            .append("destination", new Document("$ref", "destinations")
                .append("$id", new ObjectId(testDestinationId)));
        bookingDocs.add(bookingDoc);

        @SuppressWarnings("unchecked")
        com.mongodb.client.MongoCollection<Document> mockCollection = mock(com.mongodb.client.MongoCollection.class);
        @SuppressWarnings("unchecked")
        com.mongodb.client.FindIterable<Document> mockFindIterable = mock(com.mongodb.client.FindIterable.class);
        
        when(mongoTemplate.getCollection("bookings")).thenReturn(mockCollection);
        when(mockCollection.find()).thenReturn(mockFindIterable);
        when(mockFindIterable.into(any(List.class))).thenAnswer(invocation -> {
            List<Document> list = invocation.getArgument(0);
            list.addAll(bookingDocs);
            return list;
        });
        when(destinationRepository.findById(testDestinationId)).thenReturn(Optional.of(testDestination));

        // When
        List<Booking> result = bookingService.getAllBookings();

        // Then
        assertNotNull(result);
        verify(mongoTemplate, atLeastOnce()).getCollection("bookings");
    }

    @Test
    void testGetBookingsByUserId() {
        // Given
        List<Document> bookingDocs = new ArrayList<>();
        Document bookingDoc = new Document("_id", new ObjectId(testBookingId))
            .append("userId", testUserId)
            .append("status", "PENDING")
            .append("destination", new Document("$ref", "destinations")
                .append("$id", new ObjectId(testDestinationId)));
        bookingDocs.add(bookingDoc);

        @SuppressWarnings("unchecked")
        com.mongodb.client.MongoCollection<Document> mockCollection = mock(com.mongodb.client.MongoCollection.class);
        @SuppressWarnings("unchecked")
        com.mongodb.client.FindIterable<Document> mockFindIterable = mock(com.mongodb.client.FindIterable.class);
        
        when(mongoTemplate.getCollection("bookings")).thenReturn(mockCollection);
        when(mockCollection.find(any(Document.class))).thenReturn(mockFindIterable);
        when(mockFindIterable.into(any(List.class))).thenAnswer(invocation -> {
            List<Document> list = invocation.getArgument(0);
            list.addAll(bookingDocs);
            return list;
        });
        when(destinationRepository.findById(testDestinationId)).thenReturn(Optional.of(testDestination));

        // When
        List<Booking> result = bookingService.getBookingsByUserId(testUserId);

        // Then
        assertNotNull(result);
        verify(mongoTemplate, atLeastOnce()).getCollection("bookings");
    }

    @Test
    void testCancelBooking_WhenBookingExists() {
        // Given
        when(bookingRepository.findById(testBookingId)).thenReturn(Optional.of(testBooking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(testBooking);

        // When
        bookingService.cancelBooking(testBookingId);

        // Then
        verify(bookingRepository, times(1)).findById(testBookingId);
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    void testCancelBooking_WhenBookingNotExists() {
        // Given
        when(bookingRepository.findById(testBookingId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            bookingService.cancelBooking(testBookingId);
        });
        verify(bookingRepository, times(1)).findById(testBookingId);
        verify(bookingRepository, never()).save(any(Booking.class));
    }
}

