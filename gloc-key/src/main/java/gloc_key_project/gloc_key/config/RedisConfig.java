package gloc_key_project.gloc_key.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {
    @Value("${spring.data.redis.host}")
    private String host;
    @Value("${spring.data.redis.port}")
    private int port;

    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        return new LettuceConnectionFactory(host, port);
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate() {
        RedisTemplate<String, Object> redisTemplate = new RedisTemplate<>();
        // 연결 팩토리 설정
        redisTemplate.setConnectionFactory(redisConnectionFactory());
        // Key 직렬화 방식: String 형식
        redisTemplate.setKeySerializer(new StringRedisSerializer());
        // Value 직렬화 방식: String
        // 형식 (JSON 등을 저장할 때도 문자열로 관리)
        redisTemplate.setValueSerializer(new StringRedisSerializer());
        return redisTemplate;
    }
}