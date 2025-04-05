package com.urbanfood.dto;

public class MessageResponse {
    
    private String message;
    
    // Default constructor
    public MessageResponse() {
    }
    
    // Parameterized constructor
    public MessageResponse(String message) {
        this.message = message;
    }
    
    // Getters and setters
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
}