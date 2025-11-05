package com.taskclock;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
@OpenAPIDefinition(
        info = @Info(
                title = "Task Clock API",
                description = "番茄时钟系统API文档",
                version = "1.0.0"
        )
)
public class TaskClockApplication {
    public static void main(String[] args) {
        SpringApplication.run(TaskClockApplication.class, args);
    }
} 