import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

interface CartItemProps {
  id: number;
  name: string;
  price: string | number;
  imageUrl: string;
  quantity: number;
  farmName: string;
}

const CartItem: React.FC<CartItemProps> = ({ 
  id, 
  name, 
  price, 
  imageUrl, 
  quantity, 
  farmName 
}) => {
  const { increaseQuantity, decreaseQuantity, removeFromCart } = useCart();
  
  return (
    <div className="flex items-center py-4 border-b border-gray-200">
      <img 
        src={imageUrl}
        alt={name} 
        className="w-20 h-20 object-cover rounded-md"
      />
      <div className="ml-4 flex-grow">
        <h4 className="font-poppins font-medium">{name}</h4>
        <p className="text-xs text-gray-500">{farmName}</p>
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center border border-gray-300 rounded-full">
            <button 
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-primary transition-colors" 
              onClick={() => decreaseQuantity(id)}
            >
              <i className="fas fa-minus text-xs"></i>
            </button>
            <span className="w-8 text-center">{quantity}</span>
            <button 
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-primary transition-colors"
              onClick={() => increaseQuantity(id)}
            >
              <i className="fas fa-plus text-xs"></i>
            </button>
          </div>
          <span className="font-bold">{formatPrice(price)}</span>
        </div>
      </div>
      <button 
        className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
        onClick={() => removeFromCart(id)}
      >
        <i className="fas fa-trash"></i>
      </button>
    </div>
  );
};

export default CartItem;
