const Service = require('../models/serviceModel');
const Category = require('../models/categoryModel');
const AppError = require('../core/errors/AppError');

// GET /api/services - Get all active services, optional category filter
exports.getServices = async (req, res, next) => {
  try {
    const { category } = req.query;
    let query = { isActive: true };

    if (category) {
      // Find category first to get ObjectId
      const cat = await Category.findOne({ slug: category });
      if (cat) {
        query.categoryId = cat._id;
      } else {
        // If category query passed but category not found, return empty list
        return res.status(200).json({ success: true, services: [] });
      }
    }

    const services = await Service.find(query).populate('categoryId', 'name slug');
    
    const mapped = services.map(s => ({
      id: s._id,
      name: s.name,
      description: s.description,
      category: s.categoryId ? s.categoryId.name : null,
      categorySlug: s.categoryId ? s.categoryId.slug : null,
      pricingRules: {
        basePrice: s.pricingRules.basePrice,
        hourlyRate: s.pricingRules.hourlyRate
      }
    }));

    res.status(200).json({
      success: true,
      services: mapped
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/services/category/:slug - Get services filtered by category slug (explicit endpoint)
exports.getServicesByCategory = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug });
    if (!category) {
      return next(new AppError('Category not found.', 404));
    }
    const services = await Service.find({ isActive: true, categoryId: category._id }).populate('categoryId', 'name slug');
    const mapped = services.map(s => ({
      id: s._id,
      name: s.name,
      description: s.description,
      category: s.categoryId ? s.categoryId.name : null,
      categorySlug: s.categoryId ? s.categoryId.slug : null,
      pricingRules: {
        basePrice: s.pricingRules.basePrice,
        hourlyRate: s.pricingRules.hourlyRate
      }
    }));
    res.status(200).json({ success: true, services: mapped });
  } catch (err) {
    next(err);
  }
};

// GET /api/services/:id - Get a single service by ID
exports.getServiceById = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id).populate('categoryId', 'name slug');
    if (!service) {
      return next(new AppError('Service not found.', 404));
    }

    res.status(200).json({
      success: true,
      service: {
        id: service._id,
        name: service.name,
        description: service.description || `${service.name} service`,
        category: service.categoryId ? service.categoryId.name : null,
        categorySlug: service.categoryId ? service.categoryId.slug : null,
        pricingRules: {
          basePrice: service.pricingRules.basePrice,
          hourlyRate: service.pricingRules.hourlyRate
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/services - Create new service (Admin only)
exports.createService = async (req, res, next) => {
  try {
    const { name, categorySlug, description, basePrice, hourlyRate } = req.body;

    if (!name || !basePrice || !hourlyRate) {
      return next(new AppError('Name, basePrice, and hourlyRate are required fields.', 400));
    }

    let categoryId = null;
    if (categorySlug) {
      const cat = await Category.findOne({ slug: categorySlug });
      if (!cat) {
        return next(new AppError(`Category '${categorySlug}' not found.`, 404));
      }
      categoryId = cat._id;
    }

    const serviceExists = await Service.findOne({ name });
    if (serviceExists) {
      return next(new AppError('A service with this name already exists.', 409));
    }

    const newService = new Service({
      name,
      categoryId,
      description,
      pricingRules: {
        basePrice,
        hourlyRate
      }
    });

    await newService.save();

    res.status(201).json({
      success: true,
      message: 'Service created successfully.',
      service: newService
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/services/:id - Update existing service (Admin only)
exports.updateService = async (req, res, next) => {
  try {
    const { name, categorySlug, description, basePrice, hourlyRate, isActive } = req.body;

    const service = await Service.findById(req.params.id);
    if (!service) {
      return next(new AppError('Service not found.', 404));
    }

    if (name) service.name = name;
    if (description !== undefined) service.description = description;
    if (isActive !== undefined) service.isActive = isActive;

    if (categorySlug) {
      const cat = await Category.findOne({ slug: categorySlug });
      if (!cat) {
        return next(new AppError(`Category '${categorySlug}' not found.`, 404));
      }
      service.categoryId = cat._id;
    }

    if (basePrice !== undefined) service.pricingRules.basePrice = basePrice;
    if (hourlyRate !== undefined) service.pricingRules.hourlyRate = hourlyRate;

    await service.save();

    res.status(200).json({
      success: true,
      message: 'Service updated successfully.',
      service
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/services/:id - Hard or Soft delete service (Admin only)
exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return next(new AppError('Service not found.', 404));
    }

    // Soft delete by setting isActive to false
    service.isActive = false;
    await service.save();

    res.status(200).json({
      success: true,
      message: 'Service deleted (deactivated) successfully.'
    });
  } catch (err) {
    next(err);
  }
};
