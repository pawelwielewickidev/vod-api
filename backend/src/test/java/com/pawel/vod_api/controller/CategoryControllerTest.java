package com.pawel.vod_api.controller;

import com.pawel.vod_api.dto.CategoryDto;
import com.pawel.vod_api.dto.CategoryResponseDto;
import com.pawel.vod_api.service.CategoryService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.ObjectMapper;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CategoryController.class)
public class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @MockitoBean
    private CategoryService categoryService;
    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldAddNewCategory() throws Exception {
        CategoryDto incomingDto = new CategoryDto("Comedy", "Opis");

        CategoryResponseDto mockedResponse = new CategoryResponseDto(1L, "Comedy", "Opis");

        Mockito.when(categoryService.saveCategory(Mockito.any(CategoryDto.class))).thenReturn(mockedResponse);

        mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(incomingDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Comedy"))
                .andExpect(jsonPath("$.description").value("Opis"));

    }

    @Test
    void shouldReturnAllCategoriesAndStatus200() throws Exception{
        CategoryResponseDto testCategory = new CategoryResponseDto(1L, "test", "opis");

        Mockito.when(categoryService.getAllCategories()).thenReturn(List.of(testCategory));

        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("test"))
                .andExpect(jsonPath("$[0].description").value("opis"));
    }
}
