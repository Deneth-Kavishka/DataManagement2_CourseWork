package com.urbanfood.api.dto.auth;

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
    private boolean isFarmer;
    private List<String> roles;

    public JwtResponse(String accessToken, Long id, String username, String email, 
                      String fullName, boolean isFarmer, List<String> roles) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.isFarmer = isFarmer;
        this.roles = roles;
    }
}