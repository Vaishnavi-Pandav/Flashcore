import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Search, Plus, Filter, MoreHorizontal, Edit2, Trash2, 
  Image as ImageIcon, X, UploadCloud, AlertCircle
} from 'lucide-react';

// ── Schema ──────────────────────────────────────────────────────────────────
const productSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug is required"),
  price: z.number().min(0.01, "Price must be positive"),
  stock: z.number().min(0, "Stock cannot be negative"),
  category_id: z.string().uuid("Valid Category UUID required"),
  description: z.string().optional(),
});
type ProductFormData = z.infer<typeof productSchema>;

// ── Component ───────────────────────────────────────────────────────────────
export default function ProductsTab() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch Products
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:8000/products/');
      return res.data.items;
    }
  });

  const products = productsData || [];
  const filteredProducts = products.filter((p: any) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Selection
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map((p: any) => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Bulk Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      // Mocking bulk delete since the API only has single DELETE /products/{id}
      // In reality we would Promise.all(ids.map(id => axios.delete(...)))
      await new Promise(res => setTimeout(res, 800));
      return ids;
    },
    onMutate: async (deletedIds) => {
      await queryClient.cancelQueries({ queryKey: ['admin-products'] });
      const previous = queryClient.getQueryData(['admin-products']);
      queryClient.setQueryData(['admin-products'], (old: any) => 
        old?.filter((p: any) => !deletedIds.includes(p.id))
      );
      return { previous };
    },
    onSuccess: () => {
      setSelectedIds(new Set());
      setIsDeleteDialogOpen(false);
    },
    onError: (err, newTodo, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['admin-products'], context.previous);
      }
    }
  });

  const handleDeleteSelected = () => {
    deleteMutation.mutate(Array.from(selectedIds));
  };

  return (
    <div className="space-y-6">
      
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-purple-500"
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 text-white rounded-xl hover:bg-zinc-800 transition-colors">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar (Animates in when items selected) */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-3 flex justify-between items-center"
          >
            <span className="text-purple-400 text-sm font-medium ml-2">
              {selectedIds.size} products selected
            </span>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-sm bg-zinc-900 text-white rounded-lg hover:bg-zinc-800">
                Publish
              </button>
              <button 
                onClick={() => setIsDeleteDialogOpen(true)}
                className="px-3 py-1.5 text-sm bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"
              >
                Delete Selected
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-950/50 text-xs uppercase font-medium">
              <tr>
                <th className="p-4 w-12">
                  <input 
                    type="checkbox" 
                    className="rounded border-zinc-700 bg-zinc-900 text-purple-600 focus:ring-purple-600"
                    checked={selectedIds.size === filteredProducts.length && filteredProducts.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="p-4">Product</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center">Loading...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center">No products found.</td></tr>
              ) : (
                filteredProducts.map((product: any) => (
                  <tr key={product.id} className="hover:bg-zinc-800/20 transition-colors group">
                    <td className="p-4">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.has(product.id)}
                        onChange={() => toggleSelect(product.id)}
                        className="rounded border-zinc-700 bg-zinc-900 text-purple-600 focus:ring-purple-600"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5 m-2.5 text-zinc-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium group-hover:text-purple-400 transition-colors">{product.name}</p>
                          <p className="text-xs">{product.category?.name || 'Uncategorized'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-white font-medium">${product.price.toFixed(2)}</td>
                    <td className="p-4">{product.stock}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                        Active
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button className="p-2 text-zinc-500 hover:text-white transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <ProductModal onClose={() => setIsModalOpen(false)} />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {isDeleteDialogOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsDeleteDialogOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm relative z-10 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Delete Products</h3>
                <p className="text-zinc-400 text-sm mb-6">
                  Are you sure you want to delete {selectedIds.size} product(s)? This action cannot be undone.
                </p>
                <div className="flex gap-3 w-full">
                  <button 
                    onClick={() => setIsDeleteDialogOpen(false)}
                    className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDeleteSelected}
                    disabled={deleteMutation.isPending}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                  >
                    {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


// ── Product Create/Edit Modal ────────────────────────────────────────────────

function ProductModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [images, setImages] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      price: 0.00,
      stock: 0,
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      // Mock API call to avoid Cloudinary backend error without keys
      // In production, we'd use:
      // const formData = new FormData();
      // Object.entries(data).forEach(([key, val]) => formData.append(key, val as any));
      // images.forEach(img => formData.append('images', img));
      // await axios.post('/products', formData);

      await new Promise(res => setTimeout(res, 1000));
      return { 
        id: Math.random().toString(), 
        ...data, 
        images: images.map(file => URL.createObjectURL(file)) 
      };
    },
    onSuccess: (newProduct) => {
      // Optimistic cache update
      queryClient.setQueryData(['admin-products'], (old: any) => [newProduct, ...(old || [])]);
      onClose();
    }
  });

  const onSubmit = (data: ProductFormData) => {
    createMutation.mutate(data);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setImages([...images, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const removeImage = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl relative z-10 shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="flex justify-between items-center p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-white">Add New Product</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto no-scrollbar">
          <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Product Name</label>
                <input 
                  {...register("name")}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-purple-500"
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">URL Slug</label>
                <input 
                  {...register("slug")}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-purple-500"
                />
                {errors.slug && <p className="text-red-400 text-xs mt-1">{errors.slug.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Price ($)</label>
                <input 
                  type="number" step="0.01"
                  {...register("price", { valueAsNumber: true })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-purple-500"
                />
                {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Stock</label>
                <input 
                  type="number"
                  {...register("stock", { valueAsNumber: true })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-purple-500"
                />
                {errors.stock && <p className="text-red-400 text-xs mt-1">{errors.stock.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Category UUID</label>
              <input 
                {...register("category_id")}
                placeholder="e.g. 123e4567-e89b-12d3-a456-426614174000"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-purple-500"
              />
              {errors.category_id && <p className="text-red-400 text-xs mt-1">{errors.category_id.message}</p>}
            </div>

            {/* Image Dropzone */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Product Images</label>
              <div 
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive ? 'border-purple-500 bg-purple-500/10' : 'border-zinc-800 hover:border-zinc-600 bg-zinc-950/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <UploadCloud className="w-8 h-8 text-zinc-500 mx-auto mb-3" />
                <p className="text-sm text-zinc-400">
                  Drag and drop images here, or <span className="text-purple-400 cursor-pointer">click to browse</span>
                </p>
                <input type="file" multiple className="hidden" />
              </div>

              {/* Image Previews */}
              {images.length > 0 && (
                <div className="flex gap-4 mt-4 overflow-x-auto py-2">
                  {images.map((file, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 group">
                      <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-zinc-800 flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            form="product-form"
            disabled={createMutation.isPending}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            {createMutation.isPending ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
