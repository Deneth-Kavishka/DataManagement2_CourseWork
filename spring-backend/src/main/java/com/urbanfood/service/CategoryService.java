package com.urbanfood.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.urbanfood.exception.ResourceAlreadyExistsException;
import com.urbanfood.exception.ResourceNotFoundException;
import com.urbanfood.model.Category;
import com.urbanfood.repository.CategoryRepository;

@Service
@Transactional
public class CategoryService {
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
    
    public List<Category> getActiveCategories() {
        return categoryRepository.findByIsActive(true);
    }
    
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }
    
    public Category getCategoryByName(String name) {
        return categoryRepository.findByName(name)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with name: " + name));
    }
    
    public Category createCategory(Category category) {
        if (categoryRepository.existsByName(category.getName())) {
            throw new ResourceAlreadyExistsException("Category already exists with name: " + category.getName());
        }
        
        // Set defaults if not provided
        if (category.getIsActive() == null) {
            category.setIsActive(true);
        }
        
        return categoryRepository.save(category);
    }
    
    public Category updateCategory(Long id, Category categoryDetails) {
        Category category = getCategoryById(id);
        
        // Check if name is being changed and if it already exists
        if (!category.getName().equals(categoryDetails.getName()) &&
            categoryRepository.existsByName(categoryDetails.getName())) {
            throw new ResourceAlreadyExistsException("Category already exists with name: " + categoryDetails.getName());
        }
        
        // Update category details
        category.setName(categoryDetails.getName());
        category.setDescription(categoryDetails.getDescription());
        category.setImageUrl(categoryDetails.getImageUrl());
        category.setIsActive(categoryDetails.getIsActive());
        
        return categoryRepository.save(category);
    }
    
    public void deleteCategory(Long id) {
        Category category = getCategoryById(id);
        categoryRepository.delete(category);
    }
    
    public Category toggleCategoryStatus(Long id) {
        Category category = getCategoryById(id);
        category.setIsActive(!category.getIsActive());
        return categoryRepository.save(category);
    }
}