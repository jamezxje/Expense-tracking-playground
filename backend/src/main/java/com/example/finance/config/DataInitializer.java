package com.example.finance.config;

import com.example.finance.entity.Category;
import com.example.finance.entity.CategoryType;
import com.example.finance.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) {
        if (categoryRepository.count() == 0) {
            Map<String, CategoryType> defaultCategories = Map.of(
                "Lương", CategoryType.INCOME,
                "Đầu tư", CategoryType.INCOME,
                "Quà tặng", CategoryType.INCOME,
                "Ăn uống", CategoryType.EXPENSE,
                "Di chuyển", CategoryType.EXPENSE,
                "Mua sắm", CategoryType.EXPENSE,
                "Tiện ích", CategoryType.EXPENSE,
                "Giải trí", CategoryType.EXPENSE,
                "Khác", CategoryType.EXPENSE
            );
            
            defaultCategories.forEach((name, type) -> {
                categoryRepository.save(Category.builder().name(name).type(type).build());
            });
            
            System.out.println("Default categories initialized with Vietnamese names.");
        }
    }
}
