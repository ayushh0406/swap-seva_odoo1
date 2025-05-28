import Interest from '../models/Interest.js';
import mongoose from 'mongoose';

// Get all interests
export const getAllInterests = async (req, res) => {
  try {
    const { category, search, limit = 50 } = req.query;
    
    const query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    // Only return active interests
    query.status = 'active';

    const interests = await Interest.find(query)
      .sort({ name: 1 })
      .limit(parseInt(limit))
      .select('name description category image');

    res.status(200).json({
      success: true,
      count: interests.length,
      interests
    });
  } catch (error) {
    console.error('Get interests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get interest by ID
export const getInterestById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interest ID'
      });
    }

    const interest = await Interest.findById(id);
    
    if (!interest) {
      return res.status(404).json({
        success: false,
        message: 'Interest not found'
      });
    }

    res.status(200).json({
      success: true,
      interest
    });
  } catch (error) {
    console.error('Get interest error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create new interest (admin only)
export const createInterest = async (req, res) => {
  try {
    const { name, description, category, image } = req.body;
    
    // Validate input
    if (!name || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, description and category are required'
      });
    }

    // Check if interest already exists
    const existingInterest = await Interest.findOne({ name, category });
    
    if (existingInterest) {
      return res.status(400).json({
        success: false,
        message: 'Interest with this name and category already exists'
      });
    }

    // Create new interest
    const newInterest = await Interest.create({
      name,
      description,
      category,
      image: image || "",
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Interest created successfully',
      interest: newInterest
    });
  } catch (error) {
    console.error('Create interest error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update interest (admin only)
export const updateInterest = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, image, status } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interest ID'
      });
    }

    // Check if interest exists
    const interest = await Interest.findById(id);
    
    if (!interest) {
      return res.status(404).json({
        success: false,
        message: 'Interest not found'
      });
    }

    // Update fields
    if (name) interest.name = name;
    if (description) interest.description = description;
    if (category) interest.category = category;
    if (image) interest.image = image;
    if (status) interest.status = status;

    await interest.save();

    res.status(200).json({
      success: true,
      message: 'Interest updated successfully',
      interest
    });
  } catch (error) {
    console.error('Update interest error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete interest (admin only)
export const deleteInterest = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid interest ID'
      });
    }

    const interest = await Interest.findById(id);
    
    if (!interest) {
      return res.status(404).json({
        success: false,
        message: 'Interest not found'
      });
    }

    // Instead of deleting, set status to inactive
    interest.status = 'inactive';
    await interest.save();

    res.status(200).json({
      success: true,
      message: 'Interest successfully deactivated'
    });
  } catch (error) {
    console.error('Delete interest error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get interest categories
export const getInterestCategories = async (req, res) => {
  try {
    const categories = await Interest.distinct('category', { status: 'active' });
    
    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get interest categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}; 