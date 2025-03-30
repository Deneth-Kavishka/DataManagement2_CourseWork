package com.urbanfood.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Set;

@Data
public class UserDto {
    private Long id;
    
    @NotBlank
    @Size(max = 20)
    private String username;
    
    @NotBlank
    @Size(max = 50)
    @Email
    private String email;
    
    @NotBlank
    @Size(max = 100)
    private String fullName;
    
    @Size(max = 200)
    private String address;
    
    @Size(max = 50)
    private String city;
    
    @Size(max = 20)
    private String zipCode;
    
    @Size(max = 20)
    private String phone;
    
    private boolean isFarmer;
    
    @Size(max = 100)
    private String farmName;
    
    @Size(max = 500)
    private String farmDescription;
    
    private Set<String> roles;
}