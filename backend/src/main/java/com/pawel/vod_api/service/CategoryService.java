package com.pawel.vod_api.service;

import com.pawel.vod_api.dto.CategoryDto;
import com.pawel.vod_api.dto.CategoryResponseDto;
import com.pawel.vod_api.model.Category;
import com.pawel.vod_api.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public CategoryResponseDto saveCategory(CategoryDto categoryDto){
        Category category = new Category();
        category.setName(categoryDto.getName());
        category.setDescription(categoryDto.getDescription());

        Category savedCategory = categoryRepository.save(category);

        return new CategoryResponseDto(
                savedCategory.getId(),
                savedCategory.getName(),
                savedCategory.getDescription()
        );
    }
    public List<CategoryResponseDto> getAllCategories(){
        return categoryRepository.findAll().stream()
                .map(category -> new CategoryResponseDto(
                        category.getId(),
                        category.getName(),
                        category.getDescription()
                ))
                .toList();
    }
}
