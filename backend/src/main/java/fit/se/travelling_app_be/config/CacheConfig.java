package fit.se.travelling_app_be.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Cache Configuration for Redis
 * Configures TTL (Time To Live) for different cache types
 */
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.cache.interceptor.SimpleCacheErrorHandler;

@Configuration
@EnableCaching
public class CacheConfig implements CachingConfigurer {
    
    /**
     * Create ObjectMapper with Java 8 date/time support for Redis serialization
     */
    private ObjectMapper createObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        // Disable FAIL_ON_UNKNOWN_PROPERTIES để tránh lỗi khi deserialize
        mapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        return mapper;
    }
    
    /**
     * Configure Redis Cache Manager with fallback to in-memory cache if Redis is not running
     */
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory factory) {
        try {
            // Test connection quickly
            factory.getConnection().ping();
            
            // Create serializer with Java 8 date/time support
            GenericJackson2JsonRedisSerializer serializer = new GenericJackson2JsonRedisSerializer(createObjectMapper());
            
            // Default cache configuration
            RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(30))  // Default TTL: 30 phút
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                    .fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(RedisSerializationContext.SerializationPair
                    .fromSerializer(serializer))
                .disableCachingNullValues(); // Không cache null values
            
            // Cache-specific configurations
            Map<String, RedisCacheConfiguration> cacheConfigurations = new HashMap<>();
            cacheConfigurations.put("destinations", defaultConfig.entryTtl(Duration.ofHours(1)));
            cacheConfigurations.put("users", defaultConfig.entryTtl(Duration.ofMinutes(15)));
            cacheConfigurations.put("reviews", defaultConfig.entryTtl(Duration.ofMinutes(10)));
            cacheConfigurations.put("bookings", defaultConfig.entryTtl(Duration.ofMinutes(5)));
            cacheConfigurations.put("search", defaultConfig.entryTtl(Duration.ofMinutes(5)));
            
            System.out.println("✅ Redis connected successfully! Using RedisCacheManager.");
            return RedisCacheManager.builder(factory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigurations)
                .build();
        } catch (Exception e) {
            System.out.println("⚠️ Redis is not available on localhost:6379 (" + e.getMessage() + ").");
            System.out.println("🔄 Automatically falling back to in-memory ConcurrentMapCacheManager.");
            return new ConcurrentMapCacheManager("destinations", "users", "reviews", "bookings", "search");
        }
    }

    @Override
    public CacheErrorHandler errorHandler() {
        return new SimpleCacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException exception, org.springframework.cache.Cache cache, Object key) {
                System.err.println("⚠️ Cache GET error for key: " + key + ". Bypassing cache: " + exception.getMessage());
            }

            @Override
            public void handleCachePutError(RuntimeException exception, org.springframework.cache.Cache cache, Object key, Object value) {
                System.err.println("⚠️ Cache PUT error for key: " + key + ": " + exception.getMessage());
            }

            @Override
            public void handleCacheEvictError(RuntimeException exception, org.springframework.cache.Cache cache, Object key) {
                System.err.println("⚠️ Cache EVICT error for key: " + key + ": " + exception.getMessage());
            }

            @Override
            public void handleCacheClearError(RuntimeException exception, org.springframework.cache.Cache cache) {
                System.err.println("⚠️ Cache CLEAR error: " + exception.getMessage());
            }
        };
    }
}

