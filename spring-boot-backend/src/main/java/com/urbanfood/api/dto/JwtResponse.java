package com.urbanfood.api.dto;

import lombok.Data;

import java.util.List;

@Data
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private Boolean isFarmer;
    private String farmName;
    private List<String> roles;

    public JwtResponse(String token, Long id, String username, String email, String fullName, 
                      Boolean isFarmer, String farmName, List<String> roles) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.isFarmer = isFarmer;
        this.farmName = farmName;
        this.roles = roles;
    }
}