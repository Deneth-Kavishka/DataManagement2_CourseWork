package com.urbanfood.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.urbanfood.exception.ResourceNotFoundException;
import com.urbanfood.model.Order;
import com.urbanfood.model.OrderItem;
import com.urbanfood.model.Product;
import com.urbanfood.model.User;
import com.urbanfood.repository.OrderItemRepository;
import com.urbanfood.repository.OrderRepository;
import com.urbanfood.repository.ProductRepository;
import com.urbanfood.repository.UserRepository;

@Service
@Transactional
public class OrderService {
    
    @Autowired
    private OrderRepository orderRepository;
    
    @Autowired
    private OrderItemRepository orderItemRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private ProductService productService;
    
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
    
    public List<Order> getOrdersByStatus(String status) {
        return orderRepository.findByOrderStatus(status);
    }
    
    public List<Order> getOrdersByPaymentStatus(String paymentStatus) {
        return orderRepository.findByPaymentStatus(paymentStatus);
    }
    
    public List<Order> getOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.findByOrderDateBetween(startDate, endDate);
    }
    
    public Page<Order> getOrdersByDateRangePaged(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return orderRepository.findOrdersByDateRange(startDate, endDate, pageable);
    }
    
    public Double getTotalSalesByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return orderRepository.getTotalSalesByDateRange(startDate, endDate);
    }
    
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
    }
    
    public Order getOrderByOrderNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with order number: " + orderNumber));
    }
    
    public List<Order> getOrdersByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        return orderRepository.findByUser(user);
    }
    
    public Page<Order> getOrdersByUserPaged(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        return orderRepository.findOrdersByUser(user, pageable);
    }
    
    public Long countOrdersByUserAndStatus(Long userId, String status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        return orderRepository.countOrdersByUserAndStatus(user, status);
    }
    
    public List<OrderItem> getOrderItems(Long orderId) {
        Order order = getOrderById(orderId);
        return orderItemRepository.findByOrder(order);
    }
    
    @Transactional
    public Order createOrder(Order order, List<OrderItem> orderItems) {
        // Set order date if not provided
        if (order.getOrderDate() == null) {
            order.setOrderDate(LocalDateTime.now());
        }
        
        // Generate unique order number
        if (order.getOrderNumber() == null || order.getOrderNumber().isEmpty()) {
            order.setOrderNumber(generateOrderNumber());
        }
        
        // Set default status values if not provided
        if (order.getOrderStatus() == null || order.getOrderStatus().isEmpty()) {
            order.setOrderStatus("PENDING");
        }
        
        if (order.getPaymentStatus() == null || order.getPaymentStatus().isEmpty()) {
            order.setPaymentStatus("PENDING");
        }
        
        // Verify user exists
        User user = userRepository.findById(order.getUser().getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + order.getUser().getId()));
        order.setUser(user);
        
        // Calculate total amount and save order
        double totalAmount = 0.0;
        
        // Save the order first to get an ID
        Order savedOrder = orderRepository.save(order);
        
        // Process and save each order item
        for (OrderItem item : orderItems) {
            // Verify product exists
            Product product = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + item.getProduct().getId()));
            
            // Set order reference
            item.setOrder(savedOrder);
            item.setProduct(product);
            
            // Calculate item price (considering sale price if available)
            double itemPrice = (product.getSalePrice() != null && product.getSalePrice() > 0) 
                ? product.getSalePrice() : product.getPrice();
                
            item.setPrice(itemPrice);
            item.setSubtotal(itemPrice * item.getQuantity());
            
            // Save order item
            orderItemRepository.save(item);
            
            // Add to total
            totalAmount += item.getSubtotal();
            
            // Update product stock
            productService.updateProductStock(product.getId(), -item.getQuantity());
        }
        
        // Update order with final total
        savedOrder.setTotalAmount(totalAmount);
        return orderRepository.save(savedOrder);
    }
    
    public Order updateOrderStatus(Long id, String status) {
        Order order = getOrderById(id);
        order.setOrderStatus(status);
        
        // If order is cancelled, restore product quantities
        if (status.equals("CANCELLED")) {
            List<OrderItem> orderItems = orderItemRepository.findByOrder(order);
            for (OrderItem item : orderItems) {
                productService.updateProductStock(item.getProduct().getId(), item.getQuantity());
            }
        }
        
        return orderRepository.save(order);
    }
    
    public Order updatePaymentStatus(Long id, String paymentStatus) {
        Order order = getOrderById(id);
        order.setPaymentStatus(paymentStatus);
        return orderRepository.save(order);
    }
    
    public Order updateShippingInfo(Long id, String trackingNumber, String shippingCarrier) {
        Order order = getOrderById(id);
        order.setTrackingNumber(trackingNumber);
        order.setShippingCarrier(shippingCarrier);
        return orderRepository.save(order);
    }
    
    // Helper method to generate unique order number
    private String generateOrderNumber() {
        return "UF-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}