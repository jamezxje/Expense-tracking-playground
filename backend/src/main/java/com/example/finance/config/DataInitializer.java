package com.example.finance.config;

import com.example.finance.entity.Category;
import com.example.finance.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) {
        if (categoryRepository.count() == 0) {
            List<String> defaultCategories = List.of(
                "Food", "Transport", "Shopping", "Utilities", 
                "Entertainment", "Salary", "Health", "Gift", "Other"
            );
            
            defaultCategories.forEach(name -> {
                categoryRepository.save(Category.builder().name(name).build());
            });
            
            System.out.println("Default categories initialized.");
        }
    }
}
