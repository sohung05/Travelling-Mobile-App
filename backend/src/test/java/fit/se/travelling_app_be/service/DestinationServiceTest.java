package fit.se.travelling_app_be.service;

import fit.se.travelling_app_be.entity.Destination;
import fit.se.travelling_app_be.repository.DestinationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DestinationServiceTest {

    @Mock
    private DestinationRepository destinationRepository;

    @InjectMocks
    private DestinationService destinationService;

    private Destination testDestination;
    private String testDestinationId;

    @BeforeEach
    void setUp() {
        testDestinationId = "test-destination-id";
        testDestination = new Destination();
        testDestination.setId(testDestinationId);
        testDestination.setName("Test Destination");
        testDestination.setCountry("Vietnam");
        testDestination.setPrice(new BigDecimal("1000000"));
        testDestination.setRating(4.8);
        testDestination.setCategory("Beach");
        testDestination.setFeatured(true);
        testDestination.setPopular(true);
    }

    @Test
    void testGetAllDestinations() {
        // Given
        List<Destination> destinations = Arrays.asList(testDestination);
        when(destinationRepository.findAll()).thenReturn(destinations);

        // When
        List<Destination> result = destinationService.getAllDestinations();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(testDestination.getName(), result.get(0).getName());
        verify(destinationRepository, times(1)).findAll();
    }

    @Test
    void testFindById_WhenDestinationExists() {
        // Given
        when(destinationRepository.findById(testDestinationId)).thenReturn(Optional.of(testDestination));

        // When
        Optional<Destination> result = destinationService.findById(testDestinationId);

        // Then
        assertTrue(result.isPresent());
        assertEquals(testDestinationId, result.get().getId());
        verify(destinationRepository, atLeastOnce()).findById(testDestinationId);
    }

    @Test
    void testFindById_WhenDestinationNotExists() {
        // Given
        when(destinationRepository.findById(testDestinationId)).thenReturn(Optional.empty());

        // When
        Optional<Destination> result = destinationService.findById(testDestinationId);

        // Then
        assertFalse(result.isPresent());
        verify(destinationRepository, atLeastOnce()).findById(testDestinationId);
    }

    @Test
    void testGetFeaturedDestinations() {
        // Given
        List<Destination> featuredDestinations = Arrays.asList(testDestination);
        when(destinationRepository.findByFeaturedTrue()).thenReturn(featuredDestinations);

        // When
        List<Destination> result = destinationService.getFeaturedDestinations();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertTrue(result.get(0).getFeatured());
        verify(destinationRepository, times(1)).findByFeaturedTrue();
    }

    @Test
    void testGetPopularDestinations() {
        // Given
        List<Destination> popularDestinations = Arrays.asList(testDestination);
        when(destinationRepository.findByPopularTrue()).thenReturn(popularDestinations);

        // When
        List<Destination> result = destinationService.getPopularDestinations();

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertTrue(result.get(0).getPopular());
        verify(destinationRepository, times(1)).findByPopularTrue();
    }

    @Test
    void testSearchDestinations() {
        // Given
        String query = "Test";
        List<Destination> searchResults = Arrays.asList(testDestination);
        when(destinationRepository.findByNameContainingIgnoreCase(query)).thenReturn(searchResults);

        // When
        List<Destination> result = destinationService.searchDestinations(query);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(destinationRepository, times(1)).findByNameContainingIgnoreCase(query);
    }

    @Test
    void testGetDestinationsByCategory() {
        // Given
        String category = "Beach";
        List<Destination> categoryDestinations = Arrays.asList(testDestination);
        when(destinationRepository.findByCategory(category)).thenReturn(categoryDestinations);

        // When
        List<Destination> result = destinationService.getDestinationsByCategory(category);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(category, result.get(0).getCategory());
        verify(destinationRepository, times(1)).findByCategory(category);
    }

    @Test
    void testCreateDestination() {
        // Given
        when(destinationRepository.save(any(Destination.class))).thenReturn(testDestination);

        // When
        Destination result = destinationService.createDestination(testDestination);

        // Then
        assertNotNull(result);
        assertEquals(testDestinationId, result.getId());
        verify(destinationRepository, times(1)).save(testDestination);
    }

    @Test
    void testUpdateDestination_WhenDestinationExists() {
        // Given
        Destination updatedDestination = new Destination();
        updatedDestination.setName("Updated Name");
        updatedDestination.setCountry("Updated Country");
        
        when(destinationRepository.findById(testDestinationId)).thenReturn(Optional.of(testDestination));
        when(destinationRepository.save(any(Destination.class))).thenReturn(testDestination);

        // When
        Destination result = destinationService.updateDestination(testDestinationId, updatedDestination);

        // Then
        assertNotNull(result);
        verify(destinationRepository, times(1)).findById(testDestinationId);
        verify(destinationRepository, times(1)).save(any(Destination.class));
    }

    @Test
    void testUpdateDestination_WhenDestinationNotExists() {
        // Given
        Destination updatedDestination = new Destination();
        when(destinationRepository.findById(testDestinationId)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> {
            destinationService.updateDestination(testDestinationId, updatedDestination);
        });
        verify(destinationRepository, times(1)).findById(testDestinationId);
        verify(destinationRepository, never()).save(any(Destination.class));
    }

    @Test
    void testDeleteDestination() {
        // When
        destinationService.deleteDestination(testDestinationId);

        // Then
        verify(destinationRepository, times(1)).deleteById(testDestinationId);
    }

    @Test
    void testGetDestinationsByCountry() {
        // Given
        String country = "Vietnam";
        List<Destination> countryDestinations = Arrays.asList(testDestination);
        when(destinationRepository.findByCountry(country)).thenReturn(countryDestinations);

        // When
        List<Destination> result = destinationService.getDestinationsByCountry(country);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(country, result.get(0).getCountry());
        verify(destinationRepository, times(1)).findByCountry(country);
    }

    @Test
    void testGetDestinationsByPriceRange() {
        // Given
        BigDecimal minPrice = new BigDecimal("500000");
        BigDecimal maxPrice = new BigDecimal("2000000");
        List<Destination> priceRangeDestinations = Arrays.asList(testDestination);
        when(destinationRepository.findByPriceBetween(minPrice, maxPrice)).thenReturn(priceRangeDestinations);

        // When
        List<Destination> result = destinationService.getDestinationsByPriceRange(minPrice, maxPrice);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(destinationRepository, times(1)).findByPriceBetween(minPrice, maxPrice);
    }

    @Test
    void testGetDestinationsByRating() {
        // Given
        Double minRating = 4.5;
        List<Destination> ratingDestinations = Arrays.asList(testDestination);
        when(destinationRepository.findByRatingGreaterThanEqual(minRating)).thenReturn(ratingDestinations);

        // When
        List<Destination> result = destinationService.getDestinationsByRating(minRating);

        // Then
        assertNotNull(result);
        assertEquals(1, result.size());
        assertTrue(result.get(0).getRating() >= minRating);
        verify(destinationRepository, times(1)).findByRatingGreaterThanEqual(minRating);
    }
}

