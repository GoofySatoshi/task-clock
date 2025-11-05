package com.taskclock.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 全局跨域配置类
 */
@Configuration // 标记为配置类，Spring启动时自动加载
public class CorsConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry
                .addMapping("/**") // 所有后端接口
                .allowedOrigins("*") // 所有前端源（开发环境用，生产环境禁止）
                .allowedMethods("*") // 所有请求方法（GET/POST/PUT等）
                .allowedHeaders("*") // 所有请求头
                .maxAge(3600); // 预检请求缓存1小时
    }
}