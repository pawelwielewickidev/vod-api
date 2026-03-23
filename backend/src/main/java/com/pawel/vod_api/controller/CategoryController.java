package com.pawel.vod_api.controller;

import com.pawel.vod_api.dto.CategoryDto;
import com.pawel.vod_api.dto.CategoryResponseDto;
import com.pawel.vod_api.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;

    @PostMapping("/categories")
    public ResponseEntity<CategoryResponseDto> createCategory(@RequestBody CategoryDto categoryDto){
       CategoryResponseDto response = categoryService.saveCategory(categoryDto);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    @GetMapping("/categories")
    public List<CategoryResponseDto> getAllCategories(){
        return categoryService.getAllCategories();
    }

}
