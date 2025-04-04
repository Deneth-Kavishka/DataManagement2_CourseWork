package com.urbanfood.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.urbanfood.model.Order;
import com.urbanfood.model.User;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    List<Order> findByUser(User user);
    
    Optional<Order> findByOrderNumber(String orderNumber);
    
    List<Order> findByOrderStatus(String orderStatus);
    
    List<Order> findByPaymentStatus(String paymentStatus);
    
    List<Order> findByOrderDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT o FROM Order o WHERE o.user = :user ORDER BY o.orderDate DESC")
    Page<Order> findOrdersByUser(@Param("user") User user, Pageable pageable);
    
    @Query("SELECT o FROM Order o WHERE o.orderDate BETWEEN :startDate AND :endDate ORDER BY o.orderDate DESC")
    Page<Order> findOrdersByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, Pageable pageable);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.user = :user AND o.orderStatus = :status")
    Long countOrdersByUserAndStatus(@Param("user") User user, @Param("status") String status);
    
    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.orderDate BETWEEN :startDate AND :endDate AND o.orderStatus != 'CANCELLED'")
    Double getTotalSalesByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}