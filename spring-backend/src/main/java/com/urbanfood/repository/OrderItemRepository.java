package com.urbanfood.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.urbanfood.model.Order;
import com.urbanfood.model.OrderItem;
import com.urbanfood.model.Product;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    List<OrderItem> findByOrder(Order order);
    
    List<OrderItem> findByProduct(Product product);
    
    @Query("SELECT oi FROM OrderItem oi WHERE oi.order.id = :orderId")
    List<OrderItem> findByOrderId(@Param("orderId") Long orderId);
    
    @Query("SELECT oi.product.id, SUM(oi.quantity) AS totalQuantity FROM OrderItem oi " +
           "JOIN oi.order o " +
           "WHERE o.orderStatus != 'CANCELLED' " +
           "GROUP BY oi.product.id " +
           "ORDER BY totalQuantity DESC")
    List<Object[]> findTopSellingProducts(Pageable pageable);
    
    @Query("SELECT oi.product.category.id, SUM(oi.subtotal) AS totalSales FROM OrderItem oi " +
           "JOIN oi.order o " +
           "WHERE o.orderStatus != 'CANCELLED' " +
           "GROUP BY oi.product.category.id " +
           "ORDER BY totalSales DESC")
    List<Object[]> findSalesByCategory();
    
    @Query("SELECT oi.product.vendor.id, SUM(oi.subtotal) AS totalSales FROM OrderItem oi " +
           "JOIN oi.order o " +
           "WHERE o.orderStatus != 'CANCELLED' " +
           "GROUP BY oi.product.vendor.id " +
           "ORDER BY totalSales DESC")
    List<Object[]> findSalesByVendor();
}