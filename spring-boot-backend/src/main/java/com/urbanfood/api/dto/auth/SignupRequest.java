package com.urbanfood.api.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Set;

@Data
public class SignupRequest {
    @NotBlank
    @Size(min = 3, max = 20)
    private String username;

    @NotBlank
    @Size(max = 50)
    @Email
    private String email;

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;
    
    @NotBlank
    @Size(min = 2, max = 100)
    private String fullName;
    
    private boolean isFarmer;
    
    @Size(max = 100)
    private String farmName;
    
    @Size(max = 500)
    private String farmDescription;
    
    @Size(max = 200)
    private String address;
    
    @Size(max = 50)
    private String city;
    
    @Size(max = 20)
    private String zipCode;
    
    @Size(max = 20)
    private String phone;
    
    private Set<String> roles;
}