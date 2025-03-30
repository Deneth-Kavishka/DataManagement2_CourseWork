package com.urbanfood.api.repositories.oracle;

import com.urbanfood.api.models.oracle.ERole;
import com.urbanfood.api.models.oracle.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(ERole name);
}