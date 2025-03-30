
package com.urbanfood.api.models.oracle;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    public Boolean getFarmer() {
        return isFarmer;
    }

    public void setFarmer(Boolean farmer) {
        isFarmer = farmer;
    }

    @Column(unique = true)
    private String username;
    
    @Column(unique = true)
    private String email;
    
    private String password;
    private String fullName;
    private Boolean isFarmer = false;
    private String farmName;
    private String farmDescription;
    private String address;
    private String city;
    private String zipCode;
    private String phone;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();

    public User() {
    }

    public User(String username, String email, String password, String fullName, Boolean isFarmer) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.isFarmer = isFarmer;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public Boolean getIsFarmer() { return isFarmer; }
    public void setIsFarmer(Boolean farmer) { isFarmer = farmer; }

    public String getFarmName() { return farmName; }
    public void setFarmName(String farmName) { this.farmName = farmName; }

    public String getFarmDescription() { return farmDescription; }
    public void setFarmDescription(String farmDescription) { this.farmDescription = farmDescription; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getZipCode() { return zipCode; }
    public void setZipCode(String zipCode) { this.zipCode = zipCode; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Set<Role> getRoles() { return roles; }
    public void setRoles(Set<Role> roles) { this.roles = roles; }

    public boolean isFarmer() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'isFarmer'");
    }
}
